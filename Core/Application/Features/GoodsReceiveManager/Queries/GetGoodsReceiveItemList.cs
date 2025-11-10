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
    public string? ProductName { get; init; }
    public string? ProductNumber { get; init; }

    public double ReceivedQuantity { get; init; }
    public double ActualQuantity { get; init; }
    public double RemainingQuantity { get; init; }

    public double? UnitPrice { get; init; }
    public double? TaxAmount { get; init; }
    public double? FinalUnitPrice { get; init; }
    public double? MRP { get; init; }

    
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
        CreateMap<GoodsReceiveItem, GetGoodsReceiveItemListDto>()
            .ForMember(
                dest => dest.ProductName,
                opt => opt.MapFrom(src => src.PurchaseOrderItem.Product.Name)
            )
            .ForMember(
                dest => dest.ProductNumber,
                opt => opt.MapFrom(src => src.PurchaseOrderItem.Product.Number)
            )
            .ForMember(
                dest => dest.UnitPrice,
                opt => opt.MapFrom(src => src.UnitPrice)
            )
            .ForMember(
                dest => dest.TaxAmount,
                opt => opt.MapFrom(src => src.TaxAmount)
            )
            .ForMember(
                dest => dest.FinalUnitPrice,
                opt => opt.MapFrom(src => src.FinalUnitPrice)
            )
            .ForMember(
                dest => dest.MRP,
                opt => opt.MapFrom(src => src.MRP)
            );
            
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

        // ✅ Manual calculation for ActualQuantity & RemainingQuantity
        var dtoList = items.Select(x =>
        {
            var poItem = x.PurchaseOrderItem;
            var orderedQty = poItem?.Quantity ?? 0;
            var totalReceivedQty = poItem?.ReceivedQuantity ?? 0;

            var remainingQty = orderedQty - totalReceivedQty;
            if (remainingQty < 0) remainingQty = 0;

            return new GetGoodsReceiveItemListDto
            {
                Id = x.Id,
                GoodsReceiveId = x.GoodsReceiveId,
                PurchaseOrderItemId = x.PurchaseOrderItemId,
                ProductId = poItem?.ProductId,
                ProductName = poItem?.Product?.Name,
                ProductNumber = poItem?.Product?.Number,
                ActualQuantity = orderedQty,
                RemainingQuantity = remainingQty,
                ReceivedQuantity = x.ReceivedQuantity,

                // ✅ Cost & Tax details
                UnitPrice = x.UnitPrice,
                TaxAmount = x.TaxAmount,
                FinalUnitPrice = x.FinalUnitPrice,
                MRP = x.MRP,
              
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
