using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.DashboardManager.Queries;


public class GetInventoryDashboardDto
{
    public List<InventoryTransaction>? InventoryTransactionDashboard { get; init; }
    public List<BarSeries>? InventoryStockDashboard { get; init; }
}

public class GetInventoryDashboardResult
{
    public GetInventoryDashboardDto? Data { get; init; }
}

public class GetInventoryDashboardRequest : IRequest<GetInventoryDashboardResult>
{
    public string? LocationId { get; init; }

    public string? DateFilterType { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}




public class GetInventoryDashboardHandler : IRequestHandler<GetInventoryDashboardRequest, GetInventoryDashboardResult>
{
    private readonly IQueryContext _context;
    private readonly IDashBoardService _dateRangeService;

    public GetInventoryDashboardHandler(IQueryContext context, IDashBoardService dateRangeService)
    {
        _context = context;
        _dateRangeService = dateRangeService;
    }

    public async Task<GetInventoryDashboardResult> Handle(GetInventoryDashboardRequest request, CancellationToken cancellationToken)
    {
        var locationId = request.LocationId;
        var (fromDate, toDate) = _dateRangeService.GetDateRange(
        request.DateFilterType,
        request.FromDate,
        request.ToDate);


        // ---------------- INVENTORY TRANSACTIONS ----------------
        var inventoryTransactionQuery = _context.InventoryTransaction
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.Warehouse)
            .Include(x => x.Product)
            .Include(x => x.WarehouseFrom)
            .Include(x => x.WarehouseTo)
            .Where(x =>
                x.Product!.Physical == true &&
                x.Status == InventoryTransactionStatus.Confirmed
            );

        if (!string.IsNullOrEmpty(locationId))
            inventoryTransactionQuery = inventoryTransactionQuery.Where(x => x.WarehouseId == locationId);

        //if (fromDate.HasValue)
        //    inventoryTransactionQuery = inventoryTransactionQuery.Where(x => x.MovementDate >= fromDate);

        //if (toDate.HasValue)
        //    inventoryTransactionQuery = inventoryTransactionQuery.Where(x => x.MovementDate <= toDate);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            inventoryTransactionQuery = inventoryTransactionQuery.Where(x => x.MovementDate >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

            inventoryTransactionQuery = inventoryTransactionQuery.Where(x => x.MovementDate <= toExclusive);
        }
        var inventoryTransactionData = await inventoryTransactionQuery
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);


        // ---------------- INVENTORY STOCK (GROUPED) ----------------
        var inventoryStockQuery = _context.InventoryTransaction
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.Warehouse)
            .Include(x => x.Product)
            .Where(x =>
                x.Status == InventoryTransactionStatus.Confirmed &&
                x.Product!.Physical == true
            );

        if (!string.IsNullOrEmpty(locationId))
            inventoryStockQuery = inventoryStockQuery.Where(x => x.WarehouseId == locationId);

        //if (fromDate.HasValue)
        //    inventoryStockQuery = inventoryStockQuery.Where(x => x.MovementDate >= fromDate);

        //if (toDate.HasValue)
        //    inventoryStockQuery = inventoryStockQuery.Where(x => x.MovementDate <= toDate);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            inventoryStockQuery = inventoryStockQuery.Where(x => x.MovementDate >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

            inventoryStockQuery = inventoryStockQuery.Where(x => x.MovementDate <= toExclusive);
        }
        var inventoryStockData = await inventoryStockQuery
            .GroupBy(x => new { x.WarehouseId, x.ProductId })
            .Select(group => new
            {
                WarehouseId = group.Key.WarehouseId,
                ProductId = group.Key.ProductId,
                Warehouse = group.Max(x => x.Warehouse!.Name),
                Product = group.Max(x => x.Product!.Name),
                Stock = group.Sum(x => x.Stock),
                Id = group.Max(x => x.Id),
                CreatedAtUtc = group.Max(x => x.CreatedAtUtc)
            })
            .ToListAsync(cancellationToken);


        // ---------------- WAREHOUSE LIST FOR CHART SERIES ----------------
        var warehouseQuery = _context.Warehouse
            .AsNoTracking()
            .ApplyIsDeletedFilter(false);

        if (!string.IsNullOrEmpty(locationId))
            warehouseQuery = warehouseQuery.Where(x => x.Id == locationId);

        var warehouseData = await warehouseQuery
            .Select(x => x.Name)
            .ToListAsync(cancellationToken);


        // ---------------- RESULT BUILD ----------------
        return new GetInventoryDashboardResult
        {
            Data = new GetInventoryDashboardDto
            {
                InventoryTransactionDashboard = inventoryTransactionData,

                InventoryStockDashboard =
                    warehouseData
                    .Select(wh => new BarSeries
                    {
                        Type = "Column",
                        XName = "x",
                        YName = "y",
                        Name = wh ?? "",
                        DataSource = inventoryStockData
                            .Where(x => x.Warehouse == wh)
                            .Select(x => new BarDataItem
                            {
                                X = x.Product ?? string.Empty,
                                Y = (int)(x.Stock ?? 0.0),
                                TooltipMappingName = x.Product ?? string.Empty
                            }).ToList()
                    })
                    .ToList()
            }
        };
    }
}

//public class GetInventoryDashboardHandler : IRequestHandler<GetInventoryDashboardRequest, GetInventoryDashboardResult>
//{
//    private readonly IQueryContext _context;

//    public GetInventoryDashboardHandler(IQueryContext context)
//    {
//        _context = context;
//    }

//    public async Task<GetInventoryDashboardResult> Handle(GetInventoryDashboardRequest request, CancellationToken cancellationToken)
//    {

//        var inventoryTransactionData = await _context.InventoryTransaction
//            .AsNoTracking()
//            .ApplyIsDeletedFilter(false)
//            .Include(x => x.Warehouse)
//            .Include(x => x.Product)
//            .Include(x => x.WarehouseFrom)
//            .Include(x => x.WarehouseTo)
//            .Where(x =>
//                x.Product!.Physical == true &&
//                //(x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales") &&
//                x.Status == InventoryTransactionStatus.Confirmed
//            )
//            .OrderByDescending(x => x.CreatedAtUtc)
//            .ToListAsync(cancellationToken);


//        var inventoryStockData = _context.InventoryTransaction
//            .AsNoTracking()
//            .ApplyIsDeletedFilter(false)
//            .Include(x => x.Warehouse)
//            .Include(x => x.Product)
//            .Where(x =>
//                x.Status == InventoryTransactionStatus.Confirmed &&
//                //(x.Warehouse!.Type == "Store" || x.Warehouse!.Type == "Store&Sales") &&
//                x.Product!.Physical == true
//            )
//            .GroupBy(x => new { x.WarehouseId, x.ProductId })
//            .Select(group => new
//            {
//                WarehouseId = group.Key.WarehouseId,
//                ProductId = group.Key.ProductId,
//                Warehouse = group.Max(x => x.Warehouse!.Name),
//                Product = group.Max(x => x.Product!.Name),
//                Stock = group.Sum(x => x.Stock),
//                Id = group.Max(x => x.Id),
//                CreatedAtUtc = group.Max(x => x.CreatedAtUtc)
//            })
//        .ToList();

//        var warehouseData = _context.Warehouse
//            .AsNoTracking()
//            .ApplyIsDeletedFilter(false)
//            //.Where(x => (x.Type == "Store" || x.Type == "Store&Sales"))
//            .Select(x => x.Name)
//            .ToList();


//        var result = new GetInventoryDashboardResult
//        {
//            Data = new GetInventoryDashboardDto
//            {
//                InventoryTransactionDashboard = inventoryTransactionData,
//                InventoryStockDashboard =
//                    warehouseData
//                    .Select(wh => new BarSeries
//                    {
//                        Type = "Column",
//                        XName = "x",
//                        Width = 2,
//                        YName = "y",
//                        Name = wh ?? "",
//                        ColumnSpacing = 0.1,
//                        TooltipMappingName = "tooltipMappingName",
//                        DataSource = inventoryStockData
//                            .Where(x => x.Warehouse == wh)
//                            .Select(x => new BarDataItem
//                            {
//                                X = x.Product ?? string.Empty,
//                                TooltipMappingName = x.Product ?? string.Empty,
//                                Y = (int)(x.Stock ?? 0.0)
//                            }).ToList()
//                    })
//                    .ToList()
//            }
//        };

//        return result;
//    }
//}
