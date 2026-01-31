using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.DashboardManager.Queries;


public class GetCardsDashboardDto
{
    public CardsItem? CardsDashboard { get; init; }
}

public class GetCardsDashboardResult
{
    public GetCardsDashboardDto? Data { get; init; }
}

public class GetCardsDashboardRequest : IRequest<GetCardsDashboardResult>
{
    public string? LocationId { get; init; }

    public string? DateFilterType { get; init; }
    // Values: Today, Yesterday, ThisYear, LastYear, ThisFinancialYear, LastFinancialYear, Custom

    public DateTime? FromDate { get; init; }  // used when Custom
    public DateTime? ToDate { get; init; }    // used when Custom
}


public class GetCardsDashboardHandler : IRequestHandler<GetCardsDashboardRequest, GetCardsDashboardResult>
{
    private readonly IQueryContext _context;
    private readonly IDashBoardService _dashBoardService;

    public GetCardsDashboardHandler(IQueryContext context, IDashBoardService dashBoardService)
    {
        _context = context;
        _dashBoardService = dashBoardService;
    }

    public async Task<GetCardsDashboardResult> Handle(GetCardsDashboardRequest request, CancellationToken cancellationToken)
    {
        var locationId = request.LocationId;
        var (fromDate, toDate) = _dashBoardService.GetDateRange(
        request.DateFilterType,
        request.FromDate,
        request.ToDate);


        // Helper function for InventoryTransaction date filter
        IQueryable<InventoryTransaction> ApplyInventoryFilters(IQueryable<InventoryTransaction> query)
        {
            if (!string.IsNullOrEmpty(locationId))
                query = query.Where(x => x.WarehouseId == locationId);

            if (fromDate.HasValue) { 
                //query = query.Where(x => x.MovementDate >= fromDate);
                var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
                query = query.Where(x => x.MovementDate >= from);
            }
            if (toDate.HasValue) { 
                //query = query.Where(x => x.MovementDate <= toDate);
                var toExclusive = DateTime.SpecifyKind(
                                toDate.Value.Date.AddDays(1),
                                DateTimeKind.Unspecified
                            );
                query = query.Where(x => x.MovementDate < toExclusive);
            }


            return query;
        }

        // SALES
        var salesQuery = _context.SalesOrderItem.AsNoTracking().ApplyIsDeletedFilter(false);
        if (!string.IsNullOrEmpty(locationId))
            salesQuery = salesQuery.Where(x => x.SalesOrder!.LocationId == locationId);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            salesQuery = salesQuery.Where(x => x.SalesOrder!.OrderDate >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

            salesQuery = salesQuery.Where(x => x.SalesOrder!.OrderDate < toExclusive);
        }


        var salesTotal = await salesQuery.SumAsync(x => (double?)x.Quantity, cancellationToken);

        // SALES RETURN
        var salesReturnTotal = await ApplyInventoryFilters(
            _context.InventoryTransaction.AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleName == nameof(SalesReturn) && x.Status == InventoryTransactionStatus.Confirmed)
        ).SumAsync(x => (double?)x.Movement, cancellationToken);

        // PURCHASE
        var purchaseQuery = _context.PurchaseOrderItem.AsNoTracking().ApplyIsDeletedFilter(false);
        if (!string.IsNullOrEmpty(locationId))
            purchaseQuery = purchaseQuery.Where(x => x.PurchaseOrder!.LocationId == locationId);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            purchaseQuery = purchaseQuery.Where(x => x.PurchaseOrder!.OrderDate >= from);
        }
        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            ); 
            purchaseQuery = purchaseQuery.Where(x => x.PurchaseOrder!.OrderDate <= toExclusive);
        }
        var purchaseTotal = await purchaseQuery.SumAsync(x => (double?)x.Quantity, cancellationToken);

        // PURCHASE RETURN
        var purchaseReturnTotal = await ApplyInventoryFilters(
            _context.InventoryTransaction.AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleName == nameof(PurchaseReturn) && x.Status == InventoryTransactionStatus.Confirmed)
        ).SumAsync(x => (double?)x.Movement, cancellationToken);

        // DELIVERY ORDER
        var deliveryOrderTotal = await ApplyInventoryFilters(
            _context.InventoryTransaction.AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleName == nameof(DeliveryOrder) && x.Status == InventoryTransactionStatus.Confirmed)
        ).SumAsync(x => (double?)x.Movement, cancellationToken);

        // GOODS RECEIVE
        var goodsReceiveTotal = await ApplyInventoryFilters(
            _context.InventoryTransaction.AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleName == nameof(GoodsReceive) && x.Status == InventoryTransactionStatus.Confirmed)
        ).SumAsync(x => (double?)x.Movement, cancellationToken);

        // TRANSFER OUT
        var transferOutTotal = await ApplyInventoryFilters(
            _context.InventoryTransaction.AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleName == nameof(TransferOut) && x.Status == InventoryTransactionStatus.Confirmed)
        ).SumAsync(x => (double?)x.Movement, cancellationToken);

        // TRANSFER IN
        var transferInTotal = await ApplyInventoryFilters(
            _context.InventoryTransaction.AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleName == nameof(TransferIn) && x.Status == InventoryTransactionStatus.Confirmed)
        ).SumAsync(x => (double?)x.Movement, cancellationToken);

        return new GetCardsDashboardResult
        {
            Data = new GetCardsDashboardDto
            {
                CardsDashboard = new CardsItem
                {
                    SalesTotal = salesTotal,
                    SalesReturnTotal = salesReturnTotal,
                    PurchaseTotal = purchaseTotal,
                    PurchaseReturnTotal = purchaseReturnTotal,
                    DeliveryOrderTotal = deliveryOrderTotal,
                    GoodsReceiveTotal = goodsReceiveTotal,
                    TransferOutTotal = transferOutTotal,
                    TransferInTotal = transferInTotal
                }
            }
        };
    }


    //public async Task<GetCardsDashboardResult> Handle(GetCardsDashboardRequest request, CancellationToken cancellationToken)
    //{
    //    var salesTotal = await _context.SalesOrderItem
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .SumAsync(x => (double?)x.Quantity, cancellationToken);

    //    var salesReturnTotal = await _context.InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Where(x => x.ModuleName == nameof(SalesReturn) && x.Status == InventoryTransactionStatus.Confirmed)// && x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales" == false
    //        .SumAsync(x => (double?)x.Movement, cancellationToken);

    //    var purchaseTotal = await _context.PurchaseOrderItem
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .SumAsync(x => (double?)x.Quantity, cancellationToken);

    //    var purchaseReturnTotal = await _context.InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Where(x => x.ModuleName == nameof(PurchaseReturn) && x.Status == InventoryTransactionStatus.Confirmed)// && (x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales")
    //        .SumAsync(x => (double?)x.Movement, cancellationToken);

    //    var deliveryOrderTotal = await _context.InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Where(x => x.ModuleName == nameof(DeliveryOrder) && x.Status == InventoryTransactionStatus.Confirmed) //&& (x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales")
    //        .SumAsync(x => (double?)x.Movement, cancellationToken);

    //    var goodsReceiveTotal = await _context.InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Where(x => x.ModuleName == nameof(GoodsReceive) && x.Status == InventoryTransactionStatus.Confirmed)//&& (x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales")
    //        .SumAsync(x => (double?)x.Movement, cancellationToken);

    //    var transferOutTotal = await _context.InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Where(x => x.ModuleName == nameof(TransferOut) && x.Status == InventoryTransactionStatus.Confirmed)//&& (x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales")
    //        .SumAsync(x => (double?)x.Movement, cancellationToken);

    //    var transferInTotal = await _context.InventoryTransaction
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Where(x => x.ModuleName == nameof(TransferIn) && x.Status == InventoryTransactionStatus.Confirmed)//&& (x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales")
    //        .SumAsync(x => (double?)x.Movement, cancellationToken);

    //    var cardsDashboardData = new CardsItem
    //    {
    //        SalesTotal = salesTotal,
    //        SalesReturnTotal = salesReturnTotal,
    //        PurchaseTotal = purchaseTotal,
    //        PurchaseReturnTotal = purchaseReturnTotal,
    //        DeliveryOrderTotal = deliveryOrderTotal,
    //        GoodsReceiveTotal = goodsReceiveTotal,
    //        TransferOutTotal = transferOutTotal,
    //        TransferInTotal = transferInTotal
    //    };



    //    var result = new GetCardsDashboardResult
    //    {
    //        Data = new GetCardsDashboardDto
    //        {
    //            CardsDashboard = cardsDashboardData
    //        }
    //    };

    //    return result;
    //}
}
