using Application.Common.CQS.Queries;
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

    // NEW ITEM-LEVEL FINANCIAL FIELDS
    public double DiscountPercentage { get; init; }
    public double DiscountAmount { get; init; }
    public double GrossAmount { get; init; }


    // 🔥 TAX (NEW)
    //public int? TaxPercentage { get; init; }
    public double TaxAmount { get; init; }
    public double TotalAfterTax { get; init; }
    public string? TaxId { get; init; }

    public double Total { get; init; }
    public string? Summary { get; init; }
    public List<SalesOrderItemDetailsDto> Attributes { get; init; } = new();
}

public class SalesOrderItemDetailsDto
{
    public string SalesOrderItemId { get; init; } = string.Empty;
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
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

    // 🔥 NEW ORDER-LEVEL SUMMARY TOTALS
    public double BeforeTaxAmount { get; init; }      // Gross Total
    public double TotalDiscountAmount { get; init; }  // Total Savings
    public double TaxAmount { get; init; }           // Tax Amount
    public double AfterTaxAmount { get; init; }       // Net Payable

    public List<UpdateSalesOrderItemDto> Items { get; init; } = new();
    public List<DeleteSalesOrderItemDto>? DeletedItems { get; init; }
}

public class DeleteSalesOrderItemDto
{
    public string? Id { get; init; }
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
        //RuleFor(x => x.TaxId).NotEmpty();

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
// HANDLER
// -------------------------------
public class UpdateSalesOrderHandler
    : IRequestHandler<UpdateSalesOrderRequest, UpdateSalesOrderResult>
{
    private readonly ICommandRepository<SalesOrder> _repository;
    private readonly ICommandRepository<SalesOrderItem> _itemRepository;
    private readonly ICommandRepository<DeliveryOrder> _deliveryOrderRepository;
    private readonly ICommandRepository<SalesOrderItemDetails> _itemDetailsRepository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _inventoryTransactionAttributesDetailsRepository;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly SalesOrderService _salesOrderService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;
    private readonly IQueryContext _queryContext;

    public UpdateSalesOrderHandler(
        ICommandRepository<SalesOrder> repository,
        ICommandRepository<SalesOrderItem> itemRepository,
        ICommandRepository<DeliveryOrder> deliveryOrderRepository,
        ICommandRepository<SalesOrderItemDetails> itemDetailsRepository,
        ICommandRepository<InventoryTransactionAttributesDetails> inventoryTransactionAttributesDetailsRepository,
        InventoryTransactionService inventoryTransactionService,
        SalesOrderService salesOrderService,
        IUnitOfWork unitOfWork,
        ISecurityService securityService,
        IQueryContext queryContext
        )
    {
        _repository = repository;
        _itemRepository = itemRepository;
        _deliveryOrderRepository = deliveryOrderRepository;
        _itemDetailsRepository = itemDetailsRepository;
        _inventoryTransactionAttributesDetailsRepository = inventoryTransactionAttributesDetailsRepository;
        _inventoryTransactionService = inventoryTransactionService;
        _salesOrderService = salesOrderService;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
        _queryContext = queryContext;
    }

    public async Task<UpdateSalesOrderResult> Handle(UpdateSalesOrderRequest request, CancellationToken cancellationToken = default)
    {
        // 1. LOAD AND UPDATE ORDER HEADER
        var order = await _repository.GetAsync(request.Id!, cancellationToken)
            ?? throw new Exception($"Sales Order not found: {request.Id}");

        var oldStatus = order.OrderStatus;

        order.UpdatedById = request.UpdatedById;
        order.OrderDate = _securityService.ConvertToIst(request.OrderDate);
        order.OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!);
        order.Description = request.Description;
        order.CustomerId = request.CustomerId;
        order.TaxId = request.TaxId;
        order.LocationId = request.LocationId;

        // 🔥 PERSIST HEADER TOTALS FROM REQUEST
        order.BeforeTaxAmount = request.BeforeTaxAmount;
        order.TotalDiscountAmount = request.TotalDiscountAmount;
        order.TaxAmount = request.TaxAmount;
        order.AfterTaxAmount = request.AfterTaxAmount;

        _repository.Update(order);
        await _unitOfWork.SaveAsync(cancellationToken);

        // 2. LOAD EXISTING ITEMS
        var existingItems = await _itemRepository.GetQuery()
            .Where(x => x.SalesOrderId == order.Id)
            .ToListAsync(cancellationToken);

        // 3. DELETE REMOVED ITEMS
        if (request.DeletedItems != null)
        {
            foreach (var dto in request.DeletedItems)
            {
                var item = existingItems.FirstOrDefault(x => x.Id == dto.Id);
                if (item != null) _itemRepository.Delete(item);
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        // 4. ADD / UPDATE ITEMS + DETAILS
        foreach (var dto in request.Items)
        {
            SalesOrderItem item;

            if (string.IsNullOrEmpty(dto.Id))
            {
                item = new SalesOrderItem
                {
                    SalesOrderId = order.Id,
                    PluCode = dto.PluCode,
                    ProductId = dto.ProductId,
                    UnitPrice = dto.UnitPrice,
                    Quantity = dto.Quantity,

                    // PERSIST NEW ITEM DISCOUNTS
                    DiscountPercentage = dto.DiscountPercentage,
                    DiscountAmount = dto.DiscountAmount,
                    GrossAmount = dto.GrossAmount,

                    //tax
                    //TaxPercentage = dto.TaxPercentage,
                    TaxAmount = dto.TaxAmount,
                    TotalAfterTax = dto.TotalAfterTax,
                    TaxId =dto.TaxId,
                    Total = dto.Total,
                    Summary = dto.Summary
                };
                await _itemRepository.CreateAsync(item, cancellationToken);
            }
            else
            {
                item = existingItems.First(x => x.Id == dto.Id);
                item.PluCode = dto.PluCode;
                item.ProductId = dto.ProductId;
                item.UnitPrice = dto.UnitPrice;
                item.Quantity = dto.Quantity;

                // 🔥 UPDATE EXISTING ITEM DISCOUNTS
                item.DiscountPercentage = dto.DiscountPercentage;
                item.DiscountAmount = dto.DiscountAmount;
                item.GrossAmount = dto.GrossAmount;
                item.TaxId = dto.TaxId;
                item.TaxAmount = dto.TaxAmount;
                item.TotalAfterTax = dto.TotalAfterTax;
                item.Total = dto.Total;
                item.Summary = dto.Summary;

                _itemRepository.Update(item);

                // Re-sync attributes (IMEI/Serial)
                var oldDetails = await _queryContext.SalesOrderItemDetails
                    .Where(x => x.SalesOrderItemId == item.Id)
                    .ToListAsync(cancellationToken);
                _queryContext.SalesOrderItemDetails.RemoveRange(oldDetails);
            }

            foreach (var d in dto.Attributes)
            {
                await _itemDetailsRepository.CreateAsync(
                    new SalesOrderItemDetails
                    {
                        SalesOrderItemId = item.Id,
                        RowIndex = d.RowIndex,
                        IMEI1 = d.IMEI1,
                        IMEI2 = d.IMEI2,
                        ServiceNo = d.ServiceNo,
                        CreatedById = request.UpdatedById!,
                        CreatedAtUtc = DateTime.UtcNow
                    }, cancellationToken);
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        // 5. OPTIONAL RECALCULATE (Safety check)
        // _salesOrderService.Recalculate(order.Id);

        // 6. INVOICE GENERATION (If switching to Approved)
        DeliveryOrder? invoice = null;
        if (order.OrderStatus == SalesOrderStatus.Approved && oldStatus != SalesOrderStatus.Approved)
        {
            invoice = new DeliveryOrder
            {
                CreatedById = request.UpdatedById,
                Number = order.Number!.Replace("SO", "INV"),
                DeliveryDate = order.OrderDate,
                Status = DeliveryOrderStatus.Approved,
                Description = "Invoice for Sales Order " + order.Number,
                SalesOrderId = order.Id
            };

            await _deliveryOrderRepository.CreateAsync(invoice, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // Re-process inventory transactions for Approved status
            var salesItems = await _queryContext.SalesOrderItem
                .Where(x => x.SalesOrderId == order.Id)
                .ToListAsync(cancellationToken);

            foreach (var salesItem in salesItems)
            {
                var itemDetails = await _queryContext.SalesOrderItemDetails
                    .Where(x => x.SalesOrderItemId == salesItem.Id)
                    .ToListAsync(cancellationToken);

                var inventoryTx = await _inventoryTransactionService.DeliveryOrderCreateInvenTrans(
                    invoice.Id, order.LocationId!, salesItem.ProductId!, salesItem.Quantity,
                    request.UpdatedById!, cancellationToken);

                foreach (var detail in itemDetails)
                {
                    var goodsReceiveDetail = await _queryContext.GoodsReceiveItemDetails
                        .AsNoTracking()
                        .Where(x => !x.IsDeleted && (
                            (!string.IsNullOrEmpty(detail.IMEI1) && x.IMEI1 == detail.IMEI1) ||
                            (!string.IsNullOrEmpty(detail.IMEI2) && x.IMEI2 == detail.IMEI2) ||
                            (!string.IsNullOrEmpty(detail.ServiceNo) && x.ServiceNo == detail.ServiceNo)
                        )).FirstOrDefaultAsync(cancellationToken);

                    if (goodsReceiveDetail != null)
                    {
                        await _inventoryTransactionAttributesDetailsRepository.CreateAsync(
                            new InventoryTransactionAttributesDetails
                            {
                                InventoryTransactionId = inventoryTx.Id,
                                GoodsReceiveItemDetailsId = goodsReceiveDetail.Id,
                                SalesOrderItemDetailsId = detail.Id,
                                UpdatedById = request.UpdatedById,
                                UpdatedAtUtc = DateTime.UtcNow
                            }, cancellationToken);
                    }
                }
            }
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        return new UpdateSalesOrderResult { Data = order, Invoice = invoice };
    }
}

//public async Task<UpdateSalesOrderResult> Handle(UpdateSalesOrderRequest request, CancellationToken cancellationToken)
//{
//    // -----------------------------------------------------
//    // LOAD ORDER
//    // -----------------------------------------------------
//    var order = await _repository.GetAsync(request.Id!, cancellationToken)
//        ?? throw new Exception($"Sales Order not found: {request.Id}");

//    var oldStatus = order.OrderStatus;

//    // -----------------------------------------------------
//    // UPDATE ORDER FIELDS
//    // -----------------------------------------------------
//    order.UpdatedById = request.UpdatedById;
//    order.OrderDate = _securityService.ConvertToIst(request.OrderDate);
//    order.OrderStatus = (SalesOrderStatus)int.Parse(request.OrderStatus!);
//    order.Description = request.Description;
//    order.CustomerId = request.CustomerId;
//    order.TaxId = request.TaxId;
//    order.LocationId = request.LocationId;

//    _repository.Update(order);
//    await _unitOfWork.SaveAsync(cancellationToken);

//    // -----------------------------------------------------
//    // UPDATE ITEMS
//    // -----------------------------------------------------
//    var existingItems = await _itemRepository.GetQuery()
//        .Where(x => x.SalesOrderId == order.Id)
//        .ToListAsync(cancellationToken);

//    // DELETE ITEMS
//    if (request.DeletedItemIds != null)
//    {
//        foreach (var id in request.DeletedItemIds)
//        {
//            var existing = existingItems.FirstOrDefault(x => x.Id == id);
//            if (existing != null)
//            {
//                _itemRepository.Delete(existing);
//            }
//        }
//    }

//    // ADD / UPDATE
//    foreach (var dto in request.Items)
//    {
//        var existing = existingItems.FirstOrDefault(x => x.Id == dto.Id);

//        if (existing == null)
//        {
//            await _itemRepository.CreateAsync(new SalesOrderItem
//            {
//                SalesOrderId = order.Id,
//                PluCode = dto.PluCode,
//                ProductId = dto.ProductId,
//                UnitPrice = dto.UnitPrice,
//                Quantity = dto.Quantity,
//                Total = dto.Total,
//                Summary = dto.Summary
//            }, cancellationToken);
//        }
//        else
//        {
//            existing.PluCode = dto.PluCode;
//            existing.ProductId = dto.ProductId;
//            existing.UnitPrice = dto.UnitPrice;
//            existing.Quantity = dto.Quantity;
//            existing.Total = dto.Total;
//            existing.Summary = dto.Summary;
//            _itemRepository.Update(existing);
//        }
//    }

//    await _unitOfWork.SaveAsync(cancellationToken);

//    // -----------------------------------------------------
//    // RECALCULATE TOTALS
//    // -----------------------------------------------------
//    _salesOrderService.Recalculate(order.Id);

//    // -----------------------------------------------------
//    // ⭐ CREATE INVOICE ONLY WHEN STATUS = APPROVED
//    // ⭐ OTHERWISE → PROPAGATE PARENT UPDATE
//    // -----------------------------------------------------
//    DeliveryOrder? invoice = null;

//    if (order.OrderStatus == SalesOrderStatus.Approved &&
//        oldStatus != SalesOrderStatus.Approved)
//    {
//        // CREATE NEW INVOICE
//        invoice = new DeliveryOrder
//        {
//            SalesOrderId = order.Id,
//            DeliveryDate = order.OrderDate,
//            Status = DeliveryOrderStatus.Approved,
//            CreatedById = request.UpdatedById,
//            Description = "Invoice (Updated) for " + order.Number,
//            Number = order.Number!.Replace("SO", "INV")
//        };

//        await _deliveryOrderRepository.CreateAsync(invoice, cancellationToken);
//        await _unitOfWork.SaveAsync(cancellationToken);

//        // CREATE INVENTORY TRANSACTIONS (ONLY ON APPROVAL)
//        foreach (var dto in request.Items)
//        {
//            await _inventoryTransactionService.DeliveryOrderCreateInvenTrans(
//                invoice.Id,
//                order.LocationId!,
//                dto.ProductId!,
//                dto.Quantity,
//                request.UpdatedById!,
//                cancellationToken
//            );
//        }
//    }
//    else
//    {
//        // ---------------------------------------------
//        // ⭐ UPDATE EXISTING TRANSACTIONS (NO DUPLICATES)
//        // ---------------------------------------------
//        await _inventoryTransactionService.PropagateParentUpdate(
//            order.Id,
//            nameof(DeliveryOrder),
//            order.OrderDate,
//            status: (InventoryTransactionStatus?)order.OrderStatus,
//            order.IsDeleted,
//             order.UpdatedById,
//             null,
//            cancellationToken
//        );
//    }

//    return new UpdateSalesOrderResult
//    {
//        Data = order,
//        Invoice = invoice
//    };
//}
//    }
//}