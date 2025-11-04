using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PurchaseOrderManager.Queries
{
    #region DTOs

    public class GetPurchaseOrderListDto
    {
        public string? Id { get; init; }
        public string? Number { get; init; }
        public DateTime? OrderDate { get; init; }
        public string? OrderStatusName { get; init; }
        public string? Description { get; init; }
        public string? VendorId { get; init; }
        public string? VendorName { get; init; }
        public string? TaxId { get; init; }
        public string? TaxName { get; init; }
        public double? BeforeTaxAmount { get; init; }
        public double? TaxAmount { get; init; }
        public double? AfterTaxAmount { get; init; }
        public DateTime? CreatedAtUtc { get; init; }

        public string? LocationId { get; set; }

        // Only populated when PurchaseOrderId is passed
        public List<PurchaseOrderItemDto>? Items { get; init; }
    }

    public class PurchaseOrderItemDto
    {
        public string? Id { get; init; }

        public string? ProductId { get; init; }
        public string? ProductName { get; init; }
        public string? Summary { get; init; }
        public double? UnitPrice { get; init; }
        public double? Quantity { get; init; }
        public double? Total { get; init; }
        public double ReceivedQuantity { get; init; }
    }

    #endregion

    #region Mapping Profile

    public class GetPurchaseOrderListProfile : Profile
    {
        public GetPurchaseOrderListProfile()
        {
            CreateMap<PurchaseOrder, GetPurchaseOrderListDto>()
                .ForMember(dest => dest.VendorName,
                    opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Name : string.Empty))
                .ForMember(dest => dest.OrderStatusName,
                    opt => opt.MapFrom(src =>
                        src.OrderStatus.HasValue
                            ? src.OrderStatus.Value.ToFriendlyName()
                            : string.Empty))
                .ForMember(dest => dest.Items,
                    opt => opt.MapFrom(src => src.PurchaseOrderItemList));

            CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>()
                .ForMember(dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty));
        }
    }

    #endregion

    #region List Query

    public class GetPurchaseOrderListRequest : IRequest<GetPurchaseOrderListResult>
    {
        public bool IsDeleted { get; init; } = false;
        public string? LocationId { get; init; }   // ✅ added
    }


    public class GetPurchaseOrderListResult
    {
        public List<GetPurchaseOrderListDto>? Data { get; init; }
    }

    public class GetPurchaseOrderListHandler : IRequestHandler<GetPurchaseOrderListRequest, GetPurchaseOrderListResult>
    {
        private readonly IMapper _mapper;
        private readonly IQueryContext _context;

        public GetPurchaseOrderListHandler(IMapper mapper, IQueryContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<GetPurchaseOrderListResult> Handle(GetPurchaseOrderListRequest request, CancellationToken cancellationToken)
        {
            var allowedStatuses = new[]
            {
                PurchaseOrderStatus.Approved,
                PurchaseOrderStatus.Pending,
                PurchaseOrderStatus.Cancelled
            };

            var query = _context.PurchaseOrder
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)
                .Where(x => x.OrderStatus.HasValue && allowedStatuses.Contains(x.OrderStatus.Value));
                
            // ✅ Apply location filter
            if (!string.IsNullOrEmpty(request.LocationId))
            {
                query = query.Where(x => x.LocationId == request.LocationId);
            }

            // ✅ Add includes (do this after all Where filters)
            query = query
                .Include(x => x.PurchaseOrderItemList)
                    .ThenInclude(i => i.Product)
                .Include(x => x.Vendor);

            var entities = await query.ToListAsync(cancellationToken);
            var dtos = _mapper.Map<List<GetPurchaseOrderListDto>>(entities);

            return new GetPurchaseOrderListResult { Data = dtos };
        }
    }

    #endregion

    #region Goods Received List Query

    public class GetPurchaseOrderListForGoodsrecievedRequest : IRequest<GetPurchaseOrderListForGoodsrecievedResult>
    {
        public bool IsDeleted { get; init; } = false;
    }

    public class GetPurchaseOrderListForGoodsrecievedResult
    {
        public List<GetPurchaseOrderListDto>? Data { get; init; }
    }

    public class GetPurchaseOrderListForGoodsrecievedHandler
        : IRequestHandler<GetPurchaseOrderListForGoodsrecievedRequest, GetPurchaseOrderListForGoodsrecievedResult>
    {
        private readonly IMapper _mapper;
        private readonly IQueryContext _context;

        public GetPurchaseOrderListForGoodsrecievedHandler(IMapper mapper, IQueryContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<GetPurchaseOrderListForGoodsrecievedResult> Handle(
            GetPurchaseOrderListForGoodsrecievedRequest request,
            CancellationToken cancellationToken)
        {
            var allowedStatuses = new[]
            {
            PurchaseOrderStatus.Approved
        };

            // Step 1: Load purchase orders with items, vendor, tax
            var query = _context.PurchaseOrder
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)
                .Where(x => x.OrderStatus.HasValue && allowedStatuses.Contains(x.OrderStatus.Value))
                .Include(x => x.Vendor)
                .Include(x => x.PurchaseOrderItemList);

            var entities = await query.ToListAsync(cancellationToken);

            // Step 2: Filter out POs where all items are fully received
            var filteredOrders = entities
                .Where(po => po.PurchaseOrderItemList != null &&
                             po.PurchaseOrderItemList.Any(item =>
                                 (item.Quantity ?? 0) - item.ReceivedQuantity > 0))
                .ToList();

            // Step 3: Map to DTOs
            var dtos = _mapper.Map<List<GetPurchaseOrderListDto>>(filteredOrders);

            // Step 4: Return only orders that have remaining quantities
            return new GetPurchaseOrderListForGoodsrecievedResult { Data = dtos };
        }
    }

    #endregion

    #region Single Query (with items)

    public record GetPurchaseOrderRequest : IRequest<GetPurchaseOrderResult>
    {
        public string? PurchaseOrderId { get; init; }
        public bool IsDeleted { get; init; } = false;
        public string? LocationId { get; init; }   // ✅ added
    }


    public class GetPurchaseOrderResult
    {
        public List<GetPurchaseOrderListDto>? Data { get; init; }
    }

    public class GetPurchaseOrderHandler : IRequestHandler<GetPurchaseOrderRequest, GetPurchaseOrderResult>
    {
        private readonly IMapper _mapper;
        private readonly IQueryContext _context;

        public GetPurchaseOrderHandler(IMapper mapper, IQueryContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<GetPurchaseOrderResult> Handle(GetPurchaseOrderRequest request, CancellationToken cancellationToken)
        {
            var allowedStatuses = new[]
            {
        PurchaseOrderStatus.Approved
    };

            var query = _context.PurchaseOrder
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)
                .Where(x => x.OrderStatus.HasValue && allowedStatuses.Contains(x.OrderStatus.Value));

            // ✅ Apply location filter
            if (!string.IsNullOrEmpty(request.LocationId))
            {
                query = query.Where(x => x.LocationId == request.LocationId);
            }

            // ✅ Apply purchase order ID filter
            if (!string.IsNullOrEmpty(request.PurchaseOrderId))
            {
                query = query
                    .Where(x => x.Id == request.PurchaseOrderId)
                    .Include(x => x.PurchaseOrderItemList)
                        .ThenInclude(i => i.Product)
                    .Include(x => x.Vendor);
            }

            var entities = await query.ToListAsync(cancellationToken);

            // ✅ Filter and recalculate remaining quantity
            foreach (var po in entities)
            {
                if (po.PurchaseOrderItemList != null && po.PurchaseOrderItemList.Any())
                {
                    // Keep only items with remaining quantity > 0
                    po.PurchaseOrderItemList = po.PurchaseOrderItemList
                        .Where(i => (i.Quantity ?? 0) - i.ReceivedQuantity > 0)
                        .Select(i =>
                        {
                            // Replace Ordered Quantity with Remaining Quantity for display
                            var remaining = (i.Quantity ?? 0) - i.ReceivedQuantity;
                            i.Quantity = remaining;
                            return i;
                        })
                        .ToList();
                }
            }

            var dtos = _mapper.Map<List<GetPurchaseOrderListDto>>(entities);

            return new GetPurchaseOrderResult { Data = dtos };
        }
    }

    #endregion
}
