using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PurchaseOrderItemManager.Queries;

// ------------------------------------------------------------
// 1️⃣ Handler 1: GetPurchaseOrderItemByPurchaseOrderIdListHandler
//      ➜ Fetches all purchase order items by PurchaseOrderId
// ------------------------------------------------------------

public record GetPurchaseOrderItemByPurchaseOrderIdListDto
{
    public string? Id { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public string? ProductId { get; init; }
    public string? ProductName { get; init; }
    public string? ProductNumber { get; init; }
    public string? Summary { get; init; }
    public double? UnitPrice { get; init; }
    public double? Quantity { get; init; }
    public double? Total { get; init; }
    public string? TaxId { get; init; }
    public double? TaxAmount { get; init; }
    public double? TotalAfterTax { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}

public class GetPurchaseOrderItemByPurchaseOrderIdListProfile : Profile
{
    public GetPurchaseOrderItemByPurchaseOrderIdListProfile()
    {
        CreateMap<PurchaseOrderItem, GetPurchaseOrderItemByPurchaseOrderIdListDto>()
            .ForMember(dest => dest.PurchaseOrderNumber,
                opt => opt.MapFrom(src => src.PurchaseOrder != null ? src.PurchaseOrder.Number : string.Empty))
            .ForMember(dest => dest.ProductName,
                opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
            .ForMember(dest => dest.ProductNumber,
                opt => opt.MapFrom(src => src.Product != null ? src.Product.Number : string.Empty));
    }
}

public class GetPurchaseOrderItemByPurchaseOrderIdListResult
{
    public List<GetPurchaseOrderItemByPurchaseOrderIdListDto>? Data { get; init; }
}

public class GetPurchaseOrderItemByPurchaseOrderIdListRequest : IRequest<GetPurchaseOrderItemByPurchaseOrderIdListResult>
{
    public string? PurchaseOrderId { get; init; }
}

public class GetPurchaseOrderItemByPurchaseOrderIdListHandler :
    IRequestHandler<GetPurchaseOrderItemByPurchaseOrderIdListRequest, GetPurchaseOrderItemByPurchaseOrderIdListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetPurchaseOrderItemByPurchaseOrderIdListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetPurchaseOrderItemByPurchaseOrderIdListResult> Handle(
        GetPurchaseOrderItemByPurchaseOrderIdListRequest request,
        CancellationToken cancellationToken)
    {
        var query = _context.PurchaseOrderItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.PurchaseOrder)
            .Include(x => x.Product)
            .Where(x => x.PurchaseOrderId == request.PurchaseOrderId);

        var entities = await query.ToListAsync(cancellationToken);
        var dtos = _mapper.Map<List<GetPurchaseOrderItemByPurchaseOrderIdListDto>>(entities);

        return new GetPurchaseOrderItemByPurchaseOrderIdListResult { Data = dtos };
    }
}

// ------------------------------------------------------------
// 2️⃣ Handler 2: GetGoodsReceivedByPurchaseOrderIdHandler
//      ➜ Fetches Goods Received Items for a PurchaseOrderId
//      ➜ Includes RemainingQuantity (Quantity - ReceivedQuantity)
// ------------------------------------------------------------

public record GetGoodsReceivedByPurchaseOrderIdDto
{
    public string? Id { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public string? ProductId { get; init; }
    public string? ProductName { get; init; }
    public string? ProductNumber { get; init; }
    public double? Quantity { get; init; }
    public double ReceivedQuantity { get; init; }
    public double? RemainingQuantity { get; init; }
    public double? UnitPrice { get; init; }
    public double? Total { get; init; }
    public string? TaxId { get; init; }
    public double? TaxAmount { get; init; }
    public double? TotalAfterTax { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}

public class GetGoodsReceivedByPurchaseOrderIdProfile : Profile
{
    public GetGoodsReceivedByPurchaseOrderIdProfile()
    {
        CreateMap<PurchaseOrderItem, GetGoodsReceivedByPurchaseOrderIdDto>()
            .ForMember(dest => dest.PurchaseOrderNumber,
                opt => opt.MapFrom(src => src.PurchaseOrder != null ? src.PurchaseOrder.Number : string.Empty))
            .ForMember(dest => dest.ProductName,
                opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : string.Empty))
            .ForMember(dest => dest.ProductNumber,
                opt => opt.MapFrom(src => src.Product != null ? src.Product.Number : string.Empty))
            // ✅ Compute RemainingQuantity dynamically
            .ForMember(dest => dest.RemainingQuantity,
                opt => opt.MapFrom(src => (src.Quantity ?? 0) - src.ReceivedQuantity));
    }
}

public class GetGoodsReceivedByPurchaseOrderIdResult
{
    public List<GetGoodsReceivedByPurchaseOrderIdDto>? Data { get; init; }
}

public class GetGoodsReceivedByPurchaseOrderIdRequest : IRequest<GetGoodsReceivedByPurchaseOrderIdResult>
{
    public string? PurchaseOrderId { get; init; }
}

public class GetGoodsReceivedByPurchaseOrderIdHandler :
    IRequestHandler<GetGoodsReceivedByPurchaseOrderIdRequest, GetGoodsReceivedByPurchaseOrderIdResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetGoodsReceivedByPurchaseOrderIdHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetGoodsReceivedByPurchaseOrderIdResult> Handle(
        GetGoodsReceivedByPurchaseOrderIdRequest request,
        CancellationToken cancellationToken)
    {
        var query = _context.PurchaseOrderItem
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.PurchaseOrder)
            .Include(x => x.Product)
            .Where(x => x.PurchaseOrderId == request.PurchaseOrderId);

        var entities = await query.ToListAsync(cancellationToken);

        // ✅ Dynamically calculate RemainingQuantity in case mapping missed
        foreach (var item in entities)
        {
            item.RemaingQuantity = (item.Quantity ?? 0) - item.ReceivedQuantity;
        }

        var dtos = _mapper.Map<List<GetGoodsReceivedByPurchaseOrderIdDto>>(entities);

        return new GetGoodsReceivedByPurchaseOrderIdResult { Data = dtos };
    }
}
