using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.DashboardManager.Queries;


public class GetPurchaseDashboardDto
{
    public List<PurchaseOrderItem>? PurchaseOrderDashboard { get; init; }
    public List<BarSeries>? PurchaseByVendorGroupDashboard { get; init; }
    public List<BarSeries>? PurchaseByVendorCategoryDashboard { get; init; }
}

public class GetPurchaseDashboardResult
{
    public GetPurchaseDashboardDto? Data { get; init; }
}

public class GetPurchaseDashboardRequest : IRequest<GetPurchaseDashboardResult>
{
    public string? LocationId { get; init; }

    public string? DateFilterType { get; init; }  // Today, ThisWeek, LastMonth, Custom...
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}


public class GetPurchaseDashboardHandler : IRequestHandler<GetPurchaseDashboardRequest, GetPurchaseDashboardResult>
{
    private readonly IQueryContext _context;
    private readonly IDashBoardService _dashBoardService;

    public GetPurchaseDashboardHandler(IQueryContext context, IDashBoardService dashBoardService)
    {
        _context = context;
        _dashBoardService = dashBoardService;
    }

    public async Task<GetPurchaseDashboardResult> Handle(GetPurchaseDashboardRequest request, CancellationToken cancellationToken)
    {
        var locationId = request.LocationId;
        var (fromDate, toDate) = _dashBoardService.GetDateRange(
        request.DateFilterType,
        request.FromDate,
        request.ToDate);
        

        // ---------------- PURCHASE LIST (LAST 30) ----------------
        var purchaseOrderQuery = _context.PurchaseOrderItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.PurchaseOrder)
            .Include(x => x.Product)
            .Where(x => x.PurchaseOrder!.OrderStatus == PurchaseOrderStatus.Approved);

        if (!string.IsNullOrEmpty(locationId))
            purchaseOrderQuery = purchaseOrderQuery.Where(x => x.PurchaseOrder!.LocationId == locationId);

        //if (fromDate.HasValue)
        //    purchaseOrderQuery = purchaseOrderQuery.Where(x => x.PurchaseOrder!.OrderDate >= fromDate);

        //if (toDate.HasValue)
        //    purchaseOrderQuery = purchaseOrderQuery.Where(x => x.PurchaseOrder!.OrderDate <= toDate);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            purchaseOrderQuery = purchaseOrderQuery.Where(x => x.PurchaseOrder!.OrderDate >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

            purchaseOrderQuery = purchaseOrderQuery.Where(x => x.PurchaseOrder!.OrderDate <= toExclusive);
        }
        var purchaseOrderItemData = await purchaseOrderQuery
            .OrderByDescending(x => x.PurchaseOrder!.OrderDate)
            .Take(30)
            .ToListAsync(cancellationToken);


        // ---------------- PURCHASE BY VENDOR GROUP ----------------
        var vendorGroupQuery = _context.PurchaseOrderItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.PurchaseOrder)!.ThenInclude(x => x!.Vendor)!.ThenInclude(x => x!.VendorGroup)
            .Include(x => x.Product)
            .Where(x => x.Product!.Physical == true);

        if (!string.IsNullOrEmpty(locationId))
            vendorGroupQuery = vendorGroupQuery.Where(x => x.PurchaseOrder!.LocationId == locationId);

        //if (fromDate.HasValue)
        //    vendorGroupQuery = vendorGroupQuery.Where(x => x.PurchaseOrder!.OrderDate >= fromDate);

        //if (toDate.HasValue)
        //    vendorGroupQuery = vendorGroupQuery.Where(x => x.PurchaseOrder!.OrderDate <= toDate);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            vendorGroupQuery = vendorGroupQuery.Where(x => x.PurchaseOrder!.OrderDate >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

            vendorGroupQuery = vendorGroupQuery.Where(x => x.PurchaseOrder!.OrderDate <= toExclusive);
        }
        var purchaseByVendorGroupData = await vendorGroupQuery
            .Select(x => new
            {
                Status = x.PurchaseOrder!.OrderStatus,
                VendorGroupName = x.PurchaseOrder!.Vendor!.VendorGroup!.Name,
                Quantity = x.Quantity
            })
            .GroupBy(x => new { x.Status, x.VendorGroupName })
            .Select(g => new { g.Key.Status, g.Key.VendorGroupName, Quantity = g.Sum(x => x.Quantity) })
            .ToListAsync(cancellationToken);


        // ---------------- PURCHASE BY VENDOR CATEGORY ----------------
        var vendorCategoryQuery = _context.PurchaseOrderItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.PurchaseOrder)!.ThenInclude(x => x!.Vendor)!.ThenInclude(x => x!.VendorCategory)
            .Include(x => x.Product)
            .Where(x => x.Product!.Physical == true);

        if (!string.IsNullOrEmpty(locationId))
            vendorCategoryQuery = vendorCategoryQuery.Where(x => x.PurchaseOrder!.LocationId == locationId);

        //if (fromDate.HasValue)
        //    vendorCategoryQuery = vendorCategoryQuery.Where(x => x.PurchaseOrder!.OrderDate >= fromDate);

        //if (toDate.HasValue)
        //    vendorCategoryQuery = vendorCategoryQuery.Where(x => x.PurchaseOrder!.OrderDate <= toDate);
        if (fromDate.HasValue)
        {
            var from = DateTime.SpecifyKind(fromDate.Value.Date, DateTimeKind.Unspecified);
            vendorCategoryQuery = vendorCategoryQuery.Where(x => x.PurchaseOrder!.OrderDate >= from);
        }

        if (toDate.HasValue)
        {
            var toExclusive = DateTime.SpecifyKind(
                toDate.Value.Date.AddDays(1),
                DateTimeKind.Unspecified
            );

           vendorCategoryQuery = vendorCategoryQuery.Where(x => x.PurchaseOrder!.OrderDate <= toExclusive);
        }
        var purchaseByVendorCategoryData = await vendorCategoryQuery
            .Select(x => new
            {
                Status = x.PurchaseOrder!.OrderStatus,
                VendorCategoryName = x.PurchaseOrder!.Vendor!.VendorCategory!.Name,
                Quantity = x.Quantity
            })
            .GroupBy(x => new { x.Status, x.VendorCategoryName })
            .Select(g => new { g.Key.Status, g.Key.VendorCategoryName, Quantity = g.Sum(x => x.Quantity) })
            .ToListAsync(cancellationToken);


        // ---------------- RESULT BUILD ----------------
        return new GetPurchaseDashboardResult
        {
            Data = new GetPurchaseDashboardDto
            {
                PurchaseOrderDashboard = purchaseOrderItemData,

                PurchaseByVendorGroupDashboard =
                    Enum.GetValues(typeof(PurchaseOrderStatus))
                    .Cast<PurchaseOrderStatus>()
                    .Select(status => new BarSeries
                    {
                        Type = "Bar",
                        XName = "x",
                        YName = "y",
                        Name = status.ToString(),
                        DataSource = purchaseByVendorGroupData
                            .Where(x => x.Status == status)
                            .Select(x => new BarDataItem
                            {
                                X = x.VendorGroupName ?? "",
                                Y = (int)x.Quantity!.Value,
                                TooltipMappingName = x.VendorGroupName ?? ""
                            }).ToList()
                    }).ToList(),

                PurchaseByVendorCategoryDashboard =
                    Enum.GetValues(typeof(PurchaseOrderStatus))
                    .Cast<PurchaseOrderStatus>()
                    .Select(status => new BarSeries
                    {
                        Type = "Column",
                        XName = "x",
                        YName = "y",
                        Name = status.ToString(),
                        DataSource = purchaseByVendorCategoryData
                            .Where(x => x.Status == status)
                            .Select(x => new BarDataItem
                            {
                                X = x.VendorCategoryName ?? "",
                                Y = (int)x.Quantity!.Value,
                                TooltipMappingName = x.VendorCategoryName ?? ""
                            }).ToList()
                    }).ToList()
            }
        };
    }

    //public async Task<GetPurchaseDashboardResult> Handle(GetPurchaseDashboardRequest request, CancellationToken cancellationToken)
    //{

    //    var purchaseOrderItemData = await _context.PurchaseOrderItem
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Include(x => x.PurchaseOrder)
    //        .Include(x => x.Product)
    //        .Where(x => x.PurchaseOrder!.OrderStatus == PurchaseOrderStatus.Approved)
    //        .OrderByDescending(x => x.PurchaseOrder!.OrderDate)
    //        .Take(30)
    //        .ToListAsync(cancellationToken);

    //    var purchaseByVendorGroupData = _context.PurchaseOrderItem
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //            .Include(x => x.PurchaseOrder)
    //                .ThenInclude(x => x!.Vendor)
    //                    .ThenInclude(x => x!.VendorGroup)
    //            .Include(x => x.Product)
    //            .Where(x => x.Product!.Physical == true)
    //        .Select(x => new
    //        {
    //            Status = x.PurchaseOrder!.OrderStatus,
    //            VendorGroupName = x.PurchaseOrder!.Vendor!.VendorGroup!.Name,
    //            Quantity = x.Quantity
    //        })
    //        .GroupBy(x => new { x.Status, x.VendorGroupName })
    //        .Select(g => new
    //        {
    //            Status = g.Key.Status,
    //            VendorGroupName = g.Key.VendorGroupName,
    //            Quantity = g.Sum(x => x.Quantity)
    //        })
    //        .ToList();

    //    var purchaseByVendorCategoryDate = _context.PurchaseOrderItem
    //        .AsNoTracking()
    //        .ApplyIsDeletedFilter(false)
    //        .Include(x => x.PurchaseOrder)
    //            .ThenInclude(x => x!.Vendor)
    //                .ThenInclude(x => x!.VendorCategory)
    //        .Include(x => x.Product)
    //        .Where(x => x.Product!.Physical == true)
    //        .Select(x => new
    //        {
    //            Status = x.PurchaseOrder!.OrderStatus,
    //            VendorCategoryName = x.PurchaseOrder!.Vendor!.VendorCategory!.Name,
    //            Quantity = x.Quantity
    //        })
    //        .GroupBy(x => new { x.Status, x.VendorCategoryName })
    //        .Select(g => new
    //        {
    //            Status = g.Key.Status,
    //            VendorCategoryName = g.Key.VendorCategoryName,
    //            Quantity = g.Sum(x => x.Quantity)
    //        })
    //        .ToList();


    //    var result = new GetPurchaseDashboardResult
    //    {
    //        Data = new GetPurchaseDashboardDto
    //        {
    //            PurchaseOrderDashboard = purchaseOrderItemData,
    //            PurchaseByVendorGroupDashboard =
    //                Enum.GetValues(typeof(PurchaseOrderStatus))
    //                .Cast<PurchaseOrderStatus>()
    //                .Select(status => new BarSeries
    //                {
    //                    Type = "Bar",
    //                    XName = "x",
    //                    Width = 2,
    //                    YName = "y",
    //                    Name = Enum.GetName(typeof(PurchaseOrderStatus), status)!,
    //                    ColumnSpacing = 0.1,
    //                    TooltipMappingName = "tooltipMappingName",
    //                    DataSource = purchaseByVendorGroupData
    //                        .Where(x => x.Status == status)
    //                        .Select(x => new BarDataItem
    //                        {
    //                            X = x.VendorGroupName ?? "",
    //                            TooltipMappingName = x.VendorGroupName ?? "",
    //                            Y = (int)x.Quantity!.Value
    //                        }).ToList()
    //                })
    //                .ToList(),
    //            PurchaseByVendorCategoryDashboard =
    //                Enum.GetValues(typeof(PurchaseOrderStatus))
    //                .Cast<PurchaseOrderStatus>()
    //                .Select(status => new BarSeries
    //                {
    //                    Type = "Column",
    //                    XName = "x",
    //                    Width = 2,
    //                    YName = "y",
    //                    Name = Enum.GetName(typeof(PurchaseOrderStatus), status)!,
    //                    ColumnSpacing = 0.1,
    //                    TooltipMappingName = "tooltipMappingName",
    //                    DataSource = purchaseByVendorCategoryDate
    //                        .Where(x => x.Status == status)
    //                        .Select(x => new BarDataItem
    //                        {
    //                            X = x.VendorCategoryName ?? "",
    //                            TooltipMappingName = x.VendorCategoryName ?? "",
    //                            Y = (int)x.Quantity!.Value
    //                        }).ToList()
    //                })
    //                .ToList(),
    //        }
    //    };

    //    return result;
    //}


}
