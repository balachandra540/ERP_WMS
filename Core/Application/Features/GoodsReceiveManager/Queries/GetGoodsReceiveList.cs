using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Features.NegativeAdjustmentManager.Commands;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsReceiveManager.Queries;

public record GetGoodsReceiveListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public DateTime? ReceiveDate { get; init; }
    public GoodsReceiveStatus? Status { get; init; }
    public string? StatusName { get; init; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? PurchaseOrderNumber { get; init; }
    public string? LocationId { get; init; }
    public DateTime? CreatedAtUtc { get; init; }

    // ✅ Newly added fields
    public double FreightCharges { get; init; }
    public double OtherCharges { get; init; }

    // ✅ Optional: number of items in this GRN
    public int ItemCount { get; init; }
}



public class GetGoodsReceiveListProfile : Profile
{
    public GetGoodsReceiveListProfile()
    {
        CreateMap<GoodsReceive, GetGoodsReceiveListDto>()
            .ForMember(
                dest => dest.PurchaseOrderNumber,
                opt => opt.MapFrom(src =>
                    src.PurchaseOrder != null ? src.PurchaseOrder.Number : string.Empty)
            )
            .ForMember(
                dest => dest.StatusName,
                opt => opt.MapFrom(src =>
                    src.Status.HasValue ? src.Status.Value.ToFriendlyName() : string.Empty)
            )
            .ForMember(
                dest => dest.FreightCharges,
                opt => opt.MapFrom(src => src.FreightCharges)
            )
            .ForMember(
                dest => dest.OtherCharges,
                opt => opt.MapFrom(src => src.OtherCharges)
            )
            .ForMember(
                dest => dest.ItemCount,
                opt => opt.MapFrom(src =>
                    src.GoodsReceiveItems != null ? src.GoodsReceiveItems.Count : 0)
            );
    }
}

public class GetGoodsReceiveListResult
{
    public List<GetGoodsReceiveListDto>? Data { get; init; }
}

public class GetGoodsReceiveListRequest : IRequest<GetGoodsReceiveListResult>
{
    public bool IsDeleted { get; init; } = false;
    public string? LocationId { get; init; }
}

public class GetGoodsReceiveListHandler
    : IRequestHandler<GetGoodsReceiveListRequest, GetGoodsReceiveListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetGoodsReceiveListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetGoodsReceiveListResult> Handle(
        GetGoodsReceiveListRequest request,
        CancellationToken cancellationToken)
    {
        var query = _context
            .GoodsReceive
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Include(x => x.PurchaseOrder)
            .Include(x => x.GoodsReceiveItems)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.LocationId))
        {
            var locationIds = request.LocationId
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(x => x.Trim().ToLower())
                .ToList();

            query = query.Where(x =>
                x.PurchaseOrder != null &&
                x.PurchaseOrder.LocationId != null &&
                locationIds.Contains(x.PurchaseOrder.LocationId.Trim().ToLower()));
        }

        var entities = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return new GetGoodsReceiveListResult
        {
            Data = _mapper.Map<List<GetGoodsReceiveListDto>>(entities)
        };
    }
}



public class GetInventoryTransactionAttributesQuery
    : IRequest<List<CreateNegativeAdjustmentItemDetailDto>>
{
    public string ModuleId { get; init; } = default!;
    public string ProductId { get; init; } = default!;
}

public class GetInventoryTransactionAttributesHandler
    : IRequestHandler<
        GetInventoryTransactionAttributesQuery,
        List<CreateNegativeAdjustmentItemDetailDto>>
{
    private readonly ICommandRepository<GoodsReceiveItemDetails>
        _goodsReceiveItemDetailsRepository;

    private readonly ICommandRepository<InventoryTransactionAttributesDetails>
        _attrDetailsRepository;

    private readonly ICommandRepository<InventoryTransaction>
        _inventoryTransactionRepository;

    public GetInventoryTransactionAttributesHandler(
        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository,
        ICommandRepository<InventoryTransactionAttributesDetails> attrDetailsRepository,
        ICommandRepository<InventoryTransaction> inventoryTransactionRepository)
    {
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
        _attrDetailsRepository = attrDetailsRepository;
        _inventoryTransactionRepository = inventoryTransactionRepository;
    }

    public async Task<List<CreateNegativeAdjustmentItemDetailDto>> Handle(
        GetInventoryTransactionAttributesQuery request,
        CancellationToken cancellationToken)
    {
        return await _goodsReceiveItemDetailsRepository
            .GetQuery()
            .ApplyIsDeletedFilter(false)
            .Where(g =>
                _attrDetailsRepository.GetQuery()
                    .ApplyIsDeletedFilter(false)
                    .Any(a =>
                        a.GoodsReceiveItemDetailsId == g.Id &&
                        _inventoryTransactionRepository.GetQuery()
                            .ApplyIsDeletedFilter(false)
                            .Any(it =>
                                it.Id == a.InventoryTransactionId &&
                                it.ModuleId == request.ModuleId &&
                                it.ProductId == request.ProductId
                            )
                    )
            )
            .OrderBy(g => g.RowIndex)
            .Select(g => new CreateNegativeAdjustmentItemDetailDto
            {
                RowIndex = g.RowIndex,
                IMEI1 = g.IMEI1,
                IMEI2 = g.IMEI2,
                ServiceNo = g.ServiceNo
            })
            .ToListAsync(cancellationToken);
    }
}