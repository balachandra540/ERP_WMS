using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.NumberSequenceManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Application.Common.CQS.Queries;

namespace Application.Features.SalesOrderManager.Commands;

public class CreateSalesOrderResult
{
    public SalesOrder? Data { get; set; }
    public DeliveryOrder? Invoice { get; set; }
}

public class SalesOrderItemDto
{
    public int? PluCode { get; init; }
    public string? ProductId { get; init; }
    public double UnitPrice { get; init; }
    public double Quantity { get; init; }
    public double Total { get; init; }
    public string? Summary { get; init; }
    public List<CreateSalesOrderItemDetailDto> Attributes { get; init; } = new();

}
public class CreateSalesOrderItemDetailDto
{
    public string SalesOrderItemId { get; init; } = string.Empty;
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}
public class CreateSalesOrderRequest : IRequest<CreateSalesOrderResult>
{
    public DateTime? OrderDate { get; init; }
    public string? OrderStatus { get; init; }
    public string? Description { get; init; }
    public string? CustomerId { get; init; }
    public string? TaxId { get; init; }
    public string? CreatedById { get; init; }
    public string? LocationId { get; init; }

    public List<SalesOrderItemDto> Items { get; init; } = new();
}

public class CreateSalesOrderValidator : AbstractValidator<CreateSalesOrderRequest>
{
    public CreateSalesOrderValidator()
    {
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.TaxId).NotEmpty();

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("At least one item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.PluCode)
    .NotNull()
    .GreaterThan(0)
    .WithMessage("PLU Code must be a positive number.");
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
            item.RuleFor(i => i.UnitPrice).GreaterThan(0);
        });
    }
}

public class CreateSalesOrderHandler
    : IRequestHandler<CreateSalesOrderRequest, CreateSalesOrderResult>
{
    private readonly ICommandRepository<SalesOrder> _repository;
    private readonly ICommandRepository<SalesOrderItem> _itemRepository;
    private readonly ICommandRepository<DeliveryOrder> _deliveryOrderRepository;
    private readonly ICommandRepository<Warehouse> _warehouseRepository;
    private readonly ICommandRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly SalesOrderService _salesOrderService;
    private readonly ISecurityService _securityService;
    private readonly ICommandRepository<SalesOrderItemDetails> _itemDetailsRepository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _inventoryTransactionAttributesDetailsRepository;
    private readonly IQueryContext _queryContext;


    public CreateSalesOrderHandler(
        ICommandRepository<SalesOrder> repository,
        ICommandRepository<SalesOrderItem> itemRepository,
        ICommandRepository<DeliveryOrder> deliveryOrderRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        ICommandRepository<Product> productRepository,
        ICommandRepository<SalesOrderItemDetails> itemDetailsRepository, // 👈 ADD
        InventoryTransactionService inventoryTransactionService,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        SalesOrderService salesOrderService,
        ISecurityService securityService,
        ICommandRepository<InventoryTransactionAttributesDetails> inventoryTransactionAttributesDetailsRepository ,
        IQueryContext queryContext)
    {
        _repository = repository;
        _itemRepository = itemRepository;
        _deliveryOrderRepository = deliveryOrderRepository;
        _warehouseRepository = warehouseRepository;
        _productRepository = productRepository;
        _itemDetailsRepository = itemDetailsRepository; // 👈 ADD
        _inventoryTransactionService = inventoryTransactionService;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _salesOrderService = salesOrderService;
        _securityService = securityService;
        _inventoryTransactionAttributesDetailsRepository = inventoryTransactionAttributesDetailsRepository;
        _queryContext = queryContext;
    }

    public async Task<CreateSalesOrderResult> Handle(CreateSalesOrderRequest request, CancellationToken cancellationToken = default)
    {
        // ---------------------------------------------------------
        // CREATE SALES ORDER
        // ---------------------------------------------------------
        var order = new SalesOrder
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(nameof(SalesOrder), "", "SO"),
            OrderDate = _securityService.ConvertToIst(request.OrderDate),
            OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!),
            Description = request.Description,
            CustomerId = request.CustomerId,
            TaxId = request.TaxId,
            LocationId = request.LocationId
        };

        await _repository.CreateAsync(order, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // ---------------------------------------------------------
        // CREATE SALES ORDER ITEMS
        // ---------------------------------------------------------
        List<SalesOrderItemDetails> saledItemDetails = new();
        foreach (var dto in request.Items)
        {
            var item = new SalesOrderItem
            {
                SalesOrderId = order.Id,
                PluCode = dto.PluCode,   // ✔ correctly stored as int?
                ProductId = dto.ProductId,
                UnitPrice = dto.UnitPrice,
                Quantity = dto.Quantity,
                Total = dto.Total,
                Summary = dto.Summary
            };

            await _itemRepository.CreateAsync(item, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken); // REQUIRED to get item.Id

            // -------------------------------------------------
            // 🔥 INSERT SALES ORDER ITEM DETAILS (IMEI / SERVICE)
            // -------------------------------------------------
            

            foreach (var d in dto.Attributes)
            {
                var detail = new SalesOrderItemDetails
                {
                    SalesOrderItemId = item.Id,
                    RowIndex = d.RowIndex,
                    IMEI1 = d.IMEI1,
                    IMEI2 = d.IMEI2,
                    ServiceNo = d.ServiceNo,
                    CreatedById = request.CreatedById!,
                    CreatedAtUtc = DateTime.UtcNow,
                };

                await _itemDetailsRepository.CreateAsync(detail, cancellationToken);
                saledItemDetails.Add(detail);
            }

        }

        await _unitOfWork.SaveAsync(cancellationToken);

        _salesOrderService.Recalculate(order.Id);

        // ---------------------------------------------------------
        // ⭐ ONLY CREATE DELIVERY ORDER (INVOICE) WHEN CONFIRMED
        // ---------------------------------------------------------
        DeliveryOrder? invoice = null;

        if (order.OrderStatus == SalesOrderStatus.Approved)
        {
            invoice = new DeliveryOrder
            {
                CreatedById = request.CreatedById,
                Number = _numberSequenceService.GenerateNumber(nameof(DeliveryOrder), "", "INV"),
                DeliveryDate = order.OrderDate,
                Status = DeliveryOrderStatus.Approved,
                Description = "Invoice for Sales Order " + order.Number,
                SalesOrderId = order.Id
            };

            await _deliveryOrderRepository.CreateAsync(invoice, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // ---------------------------------------------------------
            // INVENTORY + ATTRIBUTE LEDGER (CORRECT)
            // ---------------------------------------------------------
            foreach (var dto in request.Items)
            {
                // 1️⃣ Find SalesOrderItem
                var salesItem = await _queryContext.SalesOrderItem
                    .FirstAsync(x =>
                        x.SalesOrderId == order.Id &&
                        x.ProductId == dto.ProductId,
                        cancellationToken);

                // 2️⃣ Load ONLY this item’s details
                var itemDetails = await _queryContext.SalesOrderItemDetails
                    .Where(x => x.SalesOrderItemId == salesItem.Id)
                    .ToListAsync(cancellationToken);

                // 3️⃣ Create inventory transaction (NO attributes inside)
                var inventoryTx = await _inventoryTransactionService
                    .DeliveryOrderCreateInvenTrans(
                        invoice.Id,
                        order.LocationId!,
                        salesItem.ProductId!,
                        salesItem.Quantity,
                        request.CreatedById!,
                        cancellationToken
                    );

                // 4️⃣ Create attribute ledger HERE (ONLY ONCE)
                foreach (var detail in itemDetails)
                {
                    await _inventoryTransactionAttributesDetailsRepository.CreateAsync(
                        new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTx.Id,
                            SalesOrderItemDetailsId = detail.Id,
                            CreatedById = request.CreatedById,
                            CreatedAtUtc = DateTime.UtcNow
                        },
                        cancellationToken
                    );
                }
            }

            await _unitOfWork.SaveAsync(cancellationToken);
        }


        return new CreateSalesOrderResult
        {
            Data = order,
            Invoice = invoice  // null if not confirmed
        };
    }
}
