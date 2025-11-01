using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsReceiveManager.Queries;

// ---------------- DTO ----------------
public record GetGoodsReceiveItemListDto
{
    public string? Id { get; init; }
    public string? GoodsReceiveId { get; init; }
    public string? PurchaseOrderItemId { get; init; }
    public string? ProductId { get; init; }
    public double ReceivedQuantity { get; init; }
    public double ActualQuantity { get; init; }
    public string? Notes { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}

// ---------------- Request & Result ----------------
public class GetGoodsReceiveItemListRequest : IRequest<GetGoodsReceiveItemListResult>
{
    public string GoodsReceiveId { get; set; } = string.Empty;
}

public class GetGoodsReceiveItemListResult
{
    public List<GetGoodsReceiveItemListDto> Data { get; init; } = new();
}

// ---------------- Mapping Profile ----------------
public class GetGoodsReceiveItemListProfile : Profile
{
    public GetGoodsReceiveItemListProfile()
    {
        CreateMap<GoodsReceiveItem, GetGoodsReceiveItemListDto>();
    }
}

// ---------------- Handler ----------------
public class GetGoodsReceiveItemListHandler : IRequestHandler<GetGoodsReceiveItemListRequest, GetGoodsReceiveItemListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetGoodsReceiveItemListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetGoodsReceiveItemListResult> Handle(GetGoodsReceiveItemListRequest request, CancellationToken cancellationToken)
    {
        var items = await _context.GoodsReceiveItem
            .AsNoTracking()
            .Include(x => x.PurchaseOrderItem)
            .ThenInclude(poi => poi.Product)
            .Where(x => x.GoodsReceiveId == request.GoodsReceiveId && !x.IsDeleted)
            .ToListAsync(cancellationToken);

        var dtoList = items.Select(x =>
        {
            var poItem = x.PurchaseOrderItem;
            var orderedQty = poItem?.Quantity ?? 0;
            var receivedQty = poItem?.ReceivedQuantity ?? 0;

            // ✅ Remaining quantity calculation
            var remainingQty = orderedQty - receivedQty;
            if (remainingQty < 0) remainingQty = 0;

            return new GetGoodsReceiveItemListDto
            {
                Id = x.Id,
                GoodsReceiveId = x.GoodsReceiveId,
                PurchaseOrderItemId = x.PurchaseOrderItemId,
                ProductId = poItem?.ProductId,
                ActualQuantity = remainingQty,      // show remaining quantity instead of ordered
                ReceivedQuantity = x.ReceivedQuantity,
                Notes = x.Notes,
                CreatedAtUtc = x.CreatedAtUtc
            };
        }).ToList();

        return new GetGoodsReceiveItemListResult
        {
            Data = dtoList
        };
    }
}
