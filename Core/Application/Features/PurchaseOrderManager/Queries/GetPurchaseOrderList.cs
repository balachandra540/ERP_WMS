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
        public string Id { get; init; }
        public string? Number { get; init; }
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

        // Only populated when PurchaseOrderId is passed
        public List<PurchaseOrderItemDto>? Items { get; init; }
    }

    public class PurchaseOrderItemDto
    {
        public string Id { get; init; }

        public string ProductId { get; init; }
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
                .ForMember(
                    dest => dest.VendorName,
                    opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Name : string.Empty)
                )
                .ForMember(
                    dest => dest.TaxName,
                    opt => opt.MapFrom(src => src.Tax != null ? src.Tax.Name : string.Empty)
                )
                .ForMember(
                    dest => dest.OrderStatusName,
                    opt => opt.MapFrom(src =>
                        src.OrderStatus.HasValue
                            ? src.OrderStatus.Value.ToFriendlyName()
                            : string.Empty
                    )
                )
                // Map items
                .ForMember(
                    dest => dest.Items,
                    opt => opt.MapFrom(src => src.PurchaseOrderItemList)
                );

            CreateMap<PurchaseOrderItem, PurchaseOrderItemDto>()
                .ForMember(
                    dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty)
                );
        }
    }

    #endregion

    #region List Query

    public class GetPurchaseOrderListRequest : IRequest<GetPurchaseOrderListResult>
    {
        public bool IsDeleted { get; init; } = false;
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
                PurchaseOrderStatus.Confirmed,
                PurchaseOrderStatus.Archived,
                PurchaseOrderStatus.PartiallyReceived
            };

            var query = _context
                .PurchaseOrder
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)
                .Where(x => x.OrderStatus.HasValue && allowedStatuses.Contains(x.OrderStatus.Value))
                .Include(x => x.Vendor)
                .Include(x => x.Tax);

            var entities = await query.ToListAsync(cancellationToken);
            var dtos = _mapper.Map<List<GetPurchaseOrderListDto>>(entities);

            return new GetPurchaseOrderListResult { Data = dtos };
        }
    }

    #endregion

    #region Single Query (with items)

    public record GetPurchaseOrderRequest : IRequest<GetPurchaseOrderResult>
    {
        public string? PurchaseOrderId { get; init; }
        public bool IsDeleted { get; init; } = false;
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
                PurchaseOrderStatus.Confirmed,
                PurchaseOrderStatus.Archived,
                PurchaseOrderStatus.PartiallyReceived
            };

            var query = _context
                .PurchaseOrder
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)
                .Where(x => x.OrderStatus.HasValue && allowedStatuses.Contains(x.OrderStatus.Value))
                .Include(x => x.Vendor)
                .Include(x => x.Tax);

            if (!string.IsNullOrEmpty(request.PurchaseOrderId))
            {
                query = query
                    .Where(x => x.Id == request.PurchaseOrderId)
                    .Include(x => x.PurchaseOrderItemList)      // one include path
                        .ThenInclude(i => i.Product)            // continuation of that path
                    .Include(x => x.Vendor)                     // separate include
                    .Include(x => x.Tax);                       // separate include
            }
            else
            {
                query = query
                    .Include(x => x.Vendor)
                    .Include(x => x.Tax);
            }

            var entities = await query.ToListAsync(cancellationToken);
            var dtos = _mapper.Map<List<GetPurchaseOrderListDto>>(entities);

            return new GetPurchaseOrderResult { Data = dtos };
        }
    }

    #endregion
}
