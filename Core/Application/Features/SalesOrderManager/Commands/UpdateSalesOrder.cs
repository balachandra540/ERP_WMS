using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SalesOrderManager.Commands;

// -------------------------------
// RESULT
// -------------------------------
public class UpdateSalesOrderResult
{
    public SalesOrder? Data { get; set; }
    public DeliveryOrder? Invoice { get; set; }
}

// -------------------------------
// ITEM DTO FOR UPDATE
// -------------------------------
public class UpdateSalesOrderItemDto
{
    public string? Id { get; init; }
    public int? PluCode { get; init; }
    public string? ProductId { get; init; }
    public double UnitPrice { get; init; }
    public double Quantity { get; init; }
    public double Total { get; init; }
    public string? Summary { get; init; }
}

// -------------------------------
// REQUEST
// -------------------------------
public class UpdateSalesOrderRequest : IRequest<UpdateSalesOrderResult>
{
    public string? Id { get; init; }
    public DateTime? OrderDate { get; init; }
    public string? OrderStatus { get; init; }
    public string? Description { get; init; }
    public string? CustomerId { get; init; }
    public string? TaxId { get; init; }
    public string? UpdatedById { get; init; }
    public string? LocationId { get; init; }

    public List<UpdateSalesOrderItemDto> Items { get; init; } = new();
    public List<string>? DeletedItemIds { get; init; }
}

// -------------------------------
// VALIDATOR
// -------------------------------
public class UpdateSalesOrderValidator : AbstractValidator<UpdateSalesOrderRequest>
{
    public UpdateSalesOrderValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.TaxId).NotEmpty();

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.PluCode)
                .NotNull()
                .GreaterThan(0);

            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
        });
    }
}

// -------------------------------
// HANDLER (FULL UPDATED)
// -------------------------------
// -----------------------------------------------------------
// HANDLER (FINAL VERSION WITH PROPER INVENTORY UPDATE LOGIC)
// -----------------------------------------------------------
public class UpdateSalesOrderHandler
    : IRequestHandler<UpdateSalesOrderRequest, UpdateSalesOrderResult>
{
    private readonly ICommandRepository<SalesOrder> _repository;
    private readonly ICommandRepository<SalesOrderItem> _itemRepository;
    private readonly ICommandRepository<DeliveryOrder> _deliveryOrderRepository;
    private readonly ICommandRepository<SalesOrder> _salesOrderRepository;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly SalesOrderService _salesOrderService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;

    public UpdateSalesOrderHandler(
        ICommandRepository<SalesOrder> repository,
        ICommandRepository<SalesOrderItem> itemRepository,
        ICommandRepository<DeliveryOrder> deliveryOrderRepository,
        InventoryTransactionService inventoryTransactionService,
        SalesOrderService salesOrderService,
        ICommandRepository<SalesOrder> salesOrderRepository,
        IUnitOfWork unitOfWork,
        ISecurityService securityService)
    {
        _repository = repository;
        _itemRepository = itemRepository;
        _deliveryOrderRepository = deliveryOrderRepository;
        _inventoryTransactionService = inventoryTransactionService;
        _salesOrderService = salesOrderService;
        _salesOrderRepository = salesOrderRepository;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
    }

    public async Task<UpdateSalesOrderResult> Handle(UpdateSalesOrderRequest request, CancellationToken cancellationToken)
    {
        // -----------------------------------------------------
        // LOAD ORDER
        // -----------------------------------------------------
        var order = await _repository.GetAsync(request.Id!, cancellationToken)
            ?? throw new Exception($"Sales Order not found: {request.Id}");

        var oldStatus = order.OrderStatus;

        // -----------------------------------------------------
        // UPDATE ORDER FIELDS
        // -----------------------------------------------------
        order.UpdatedById = request.UpdatedById;
        order.OrderDate = _securityService.ConvertToIst(request.OrderDate);
        order.OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!);
        order.Description = request.Description;
        order.CustomerId = request.CustomerId;
        order.TaxId = request.TaxId;
        order.LocationId = request.LocationId;

        _repository.Update(order);
        await _unitOfWork.SaveAsync(cancellationToken);

        // -----------------------------------------------------
        // UPDATE ITEMS
        // -----------------------------------------------------
        var existingItems = await _itemRepository.GetQuery()
            .Where(x => x.SalesOrderId == order.Id)
            .ToListAsync(cancellationToken);

        // DELETE ITEMS
        if (request.DeletedItemIds != null)
        {
            foreach (var id in request.DeletedItemIds)
            {
                var existing = existingItems.FirstOrDefault(x => x.Id == id);
                if (existing != null)
                {
                    _itemRepository.Delete(existing);
                }
            }
        }

        // ADD / UPDATE
        foreach (var dto in request.Items)
        {
            var existing = existingItems.FirstOrDefault(x => x.Id == dto.Id);

            if (existing == null)
            {
                await _itemRepository.CreateAsync(new SalesOrderItem
                {
                    SalesOrderId = order.Id,
                    PluCode = dto.PluCode,
                    ProductId = dto.ProductId,
                    UnitPrice = dto.UnitPrice,
                    Quantity = dto.Quantity,
                    Total = dto.Total,
                    Summary = dto.Summary
                }, cancellationToken);
            }
            else
            {
                existing.PluCode = dto.PluCode;
                existing.ProductId = dto.ProductId;
                existing.UnitPrice = dto.UnitPrice;
                existing.Quantity = dto.Quantity;
                existing.Total = dto.Total;
                existing.Summary = dto.Summary;
                _itemRepository.Update(existing);
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        // -----------------------------------------------------
        // RECALCULATE TOTALS
        // -----------------------------------------------------
        _salesOrderService.Recalculate(order.Id);

        // -----------------------------------------------------
        // ⭐ CREATE INVOICE ONLY WHEN STATUS = APPROVED
        // ⭐ OTHERWISE → PROPAGATE PARENT UPDATE
        // -----------------------------------------------------
        DeliveryOrder? invoice = null;

        if (order.OrderStatus == SalesOrderStatus.Approved &&
            oldStatus != SalesOrderStatus.Approved)
        {
            // CREATE NEW INVOICE
            invoice = new DeliveryOrder
            {
                SalesOrderId = order.Id,
                DeliveryDate = order.OrderDate,
                Status = DeliveryOrderStatus.Approved,
                CreatedById = request.UpdatedById,
                Description = "Invoice (Updated) for " + order.Number,
                Number = order.Number!.Replace("SO", "INV")
            };

            await _deliveryOrderRepository.CreateAsync(invoice, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // CREATE INVENTORY TRANSACTIONS (ONLY ON APPROVAL)
            foreach (var dto in request.Items)
            {
                await _inventoryTransactionService.DeliveryOrderCreateInvenTrans(
                    invoice.Id,
                    order.LocationId!,
                    dto.ProductId!,
                    dto.Quantity,
                    request.UpdatedById!,
                    cancellationToken
                );
            }
        }
        else
        {
            // ---------------------------------------------
            // ⭐ UPDATE EXISTING TRANSACTIONS (NO DUPLICATES)
            // ---------------------------------------------
            await _inventoryTransactionService.PropagateParentUpdate(
                order.Id,
                nameof(DeliveryOrder),
                order.OrderDate,
                status: (InventoryTransactionStatus?)order.OrderStatus,
                order.IsDeleted,
                 order.UpdatedById,
                 null,
                cancellationToken
            );
        }

        return new UpdateSalesOrderResult
        {
            Data = order,
            Invoice = invoice
        };
    }
}
