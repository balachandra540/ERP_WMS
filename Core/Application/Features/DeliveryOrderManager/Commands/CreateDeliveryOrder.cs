using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.DeliveryOrderManager.Commands;

public class CreateDeliveryOrderResult
{
    public DeliveryOrder? Data { get; set; }
}

public class CreateDeliveryOrderRequest : IRequest<CreateDeliveryOrderResult>
{
    public DateTime? DeliveryDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? SalesOrderId { get; init; }
    public string? CreatedById { get; init; }
}

public class CreateDeliveryOrderValidator : AbstractValidator<CreateDeliveryOrderRequest>
{
    public CreateDeliveryOrderValidator()
    {
        RuleFor(x => x.DeliveryDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.SalesOrderId).NotEmpty();
    }
}

public class CreateDeliveryOrderHandler : IRequestHandler<CreateDeliveryOrderRequest, CreateDeliveryOrderResult>
{
    private readonly ICommandRepository<DeliveryOrder> _deliveryOrderRepository;
    private readonly ICommandRepository<SalesOrder> _salesOrderRepository;
    private readonly ICommandRepository<SalesOrderItem> _salesOrderItemRepository;
    private readonly ICommandRepository<Warehouse> _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;


    public CreateDeliveryOrderHandler(
        ICommandRepository<DeliveryOrder> deliveryOrderRepository,
        ICommandRepository<SalesOrder> salesOrderRepository,
        ICommandRepository<SalesOrderItem> salesOrderItemRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService
        )
    {
        _deliveryOrderRepository = deliveryOrderRepository;
        _salesOrderRepository = salesOrderRepository;
        _salesOrderItemRepository = salesOrderItemRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;

    }

    public async Task<CreateDeliveryOrderResult> Handle(CreateDeliveryOrderRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new DeliveryOrder
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(nameof(DeliveryOrder), "", "DO"),
            DeliveryDate = _securityService.ConvertToIst(request.DeliveryDate),
            Status = (DeliveryOrderStatus)int.Parse(request.Status!),
            Description = request.Description,
            SalesOrderId = request.SalesOrderId
        };

        await _deliveryOrderRepository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // ✅ Get related SalesOrder (to read LocationId)
        var salesOrder = await _salesOrderRepository
            .GetQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == entity.SalesOrderId, cancellationToken);

        if (salesOrder == null)
            throw new Exception("Sales Order not found.");

        // ✅ Get items of that SalesOrder
        var items = await _salesOrderItemRepository
            .GetQuery()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.SalesOrderId == entity.SalesOrderId)
            .Include(x => x.Product)
            .ToListAsync(cancellationToken);

        // ✅ Create inventory transactions using SalesOrder.LocationId
        foreach (var item in items)
        {
            if (item?.Product?.Physical ?? false)
            {
                await _inventoryTransactionService.DeliveryOrderCreateInvenTrans(
                    entity.Id,
                    salesOrder.LocationId,   // 👈 directly use SaleOrder.LocationId here
                    item.ProductId,
                    item.Quantity,
                    entity.CreatedById,
                    cancellationToken
                );
            }
        }

        return new CreateDeliveryOrderResult
        {
            Data = entity
        };
    }
}