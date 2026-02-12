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

    //  NEW ITEM-LEVEL FIELDS
    public double DiscountPercentage { get; init; }
    public double DiscountAmount { get; init; }
    public double GrossAmount { get; init; }

    //  TAX (NEW)
    //public int? TaxPercentage { get; init; }
    public string? TaxId { get; init; }

    public double TaxAmount { get; init; }
    public double TotalAfterTax { get; init; }
    public double Total { get; init; }
    public string? Summary { get; init; }
    public List<CreateSalesOrderItemDetailDto> Attributes { get; init; } = new();
    // 🔥 NEW UP-TO DISCOUNT & APPROVAL FIELDS
    public double UpToDiscount { get; init; }      // The manual % entered
    public string? ApprovalStatus { get; init; }    // "Approved" or "Auto-Approved"
    public string? ApproverGroupId { get; init; }   // The ID of the manager group that approved
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

    // 🔥 NEW ORDER-LEVEL TOTALS
    public double BeforeTaxAmount { get; init; }
    public double TotalDiscountAmount { get; init; }
    public double TaxAmount { get; init; }
    public double AfterTaxAmount { get; init; }

    public List<SalesOrderItemDto> Items { get; init; } = new();
}

public class CreateSalesOrderValidator : AbstractValidator<CreateSalesOrderRequest>
{
    public CreateSalesOrderValidator()
    {
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.OrderStatus).NotEmpty();
        RuleFor(x => x.CustomerId).NotEmpty();
       // RuleFor(x => x.TaxId).NotEmpty();

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
    private readonly ICommandRepository<GoodsReceiveItemDetails> _goodsReceiveItemDetailsRepository;
    private readonly IQueryContext _queryContext;

    public CreateSalesOrderHandler(
        ICommandRepository<SalesOrder> repository,
        ICommandRepository<SalesOrderItem> itemRepository,
        ICommandRepository<DeliveryOrder> deliveryOrderRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        ICommandRepository<Product> productRepository,
        ICommandRepository<SalesOrderItemDetails> itemDetailsRepository,
        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository,
        InventoryTransactionService inventoryTransactionService,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        SalesOrderService salesOrderService,
        ISecurityService securityService,
        ICommandRepository<InventoryTransactionAttributesDetails> inventoryTransactionAttributesDetailsRepository,
        IQueryContext queryContext)
    {
        _repository = repository;
        _itemRepository = itemRepository;
        _deliveryOrderRepository = deliveryOrderRepository;
        _warehouseRepository = warehouseRepository;
        _productRepository = productRepository;
        _itemDetailsRepository = itemDetailsRepository;
        _inventoryTransactionService = inventoryTransactionService;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _salesOrderService = salesOrderService;
        _securityService = securityService;
        _inventoryTransactionAttributesDetailsRepository = inventoryTransactionAttributesDetailsRepository;
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
        _queryContext = queryContext;
    }

    public async Task<CreateSalesOrderResult> Handle(CreateSalesOrderRequest request, CancellationToken cancellationToken = default)
    {
        // ---------------------------------------------------------
        // 1. CREATE SALES ORDER (HEADER)
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
            LocationId = request.LocationId,

            //  SAVING ORDER-LEVEL TOTALS
            BeforeTaxAmount = request.BeforeTaxAmount,
            TotalDiscountAmount = request.TotalDiscountAmount,
            TaxAmount = request.TaxAmount,
            AfterTaxAmount = request.AfterTaxAmount
        };

        await _repository.CreateAsync(order, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // ---------------------------------------------------------
        // 2. CREATE SALES ORDER ITEMS (LINES)
        // ---------------------------------------------------------
        foreach (var dto in request.Items)
        {
            var item = new SalesOrderItem
            {
                SalesOrderId = order.Id,
                PluCode = dto.PluCode,
                ProductId = dto.ProductId,
                UnitPrice = dto.UnitPrice,
                Quantity = dto.Quantity,

                //  SAVING ITEM-LEVEL DISCOUNTS
                DiscountPercentage = dto.DiscountPercentage,
                DiscountAmount = dto.DiscountAmount,
                GrossAmount = dto.GrossAmount,
                // 🔥 SAVING NEW UP-TO DISCOUNT FIELDS
                UpToDiscount = dto.UpToDiscount,
                ApprovalStatus = dto.ApprovalStatus,
                ApproverGroupId = dto.ApproverGroupId,
                // TAX 
                //TaxPercentage = dto.TaxPercentage,
                TaxAmount = dto.TaxAmount,
                TotalAfterTax = dto.TotalAfterTax,

                TaxId =dto.TaxId,
                Total = dto.Total, // Final line total (Net)
                Summary = dto.Summary
            };

            await _itemRepository.CreateAsync(item, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // -------------------------------------------------
            // 3. INSERT ITEM DETAILS (IMEI / SERIAL)
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
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        // ---------------------------------------------------------
        // 4. CREATE DELIVERY ORDER (INVOICE) IF APPROVED
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

            // INVENTORY + ATTRIBUTE LEDGER
            foreach (var dto in request.Items)
            {
                var salesItem = await _queryContext.SalesOrderItem
                    .FirstAsync(x => x.SalesOrderId == order.Id && x.ProductId == dto.ProductId, cancellationToken);

                var itemDetails = await _queryContext.SalesOrderItemDetails
                    .Where(x => x.SalesOrderItemId == salesItem.Id)
                    .ToListAsync(cancellationToken);

                var inventoryTx = await _inventoryTransactionService
                    .DeliveryOrderCreateInvenTrans(
                        invoice.Id,
                        order.LocationId!,
                        salesItem.ProductId!,
                        salesItem.Quantity,
                        request.CreatedById!,
                        cancellationToken
                    );

                foreach (var detail in itemDetails)
                {
                    var goodsReceiveDetail = await _queryContext.GoodsReceiveItemDetails
                    .AsNoTracking()
                    .Where(x => !x.IsDeleted && (
                            (!string.IsNullOrEmpty(detail.IMEI1) && x.IMEI1 == detail.IMEI1) ||
                            (!string.IsNullOrEmpty(detail.IMEI2) && x.IMEI2 == detail.IMEI2) ||
                            (!string.IsNullOrEmpty(detail.ServiceNo) && x.ServiceNo == detail.ServiceNo)
                        ))
                    .FirstOrDefaultAsync(cancellationToken);

                    if (goodsReceiveDetail == null)
                    {
                        throw new Exception($"Stock item not found for IMEI/ServiceNo.");
                    }

                    await _inventoryTransactionAttributesDetailsRepository.CreateAsync(
                        new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTx.Id,
                            GoodsReceiveItemDetailsId = goodsReceiveDetail.Id,
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
            Invoice = invoice
        };
    }
}