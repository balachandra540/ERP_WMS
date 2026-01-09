using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Application.Features.InventoryTransactionManager.Queries;
using AutoMapper;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace Application.Features.ProductManager.Queries;

public record GetProductListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public double? UnitPrice { get; init; }
    public bool? Physical { get; init; }
    public string? UnitMeasureId { get; init; }
    public string? UnitMeasureName { get; init; }
    public string? ProductGroupId { get; init; }
    public string? ProductGroupName { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
    public string? WarehouseId { get; init; }
    public string? TaxId { get; init; }
    public string? TaxName { get; init; }
    // ────────────────────── NEW FIELDS ──────────────────────
    public string? Attribute1Id { get; init; }
    public string? Attribute1Name { get; init; } // Optional: display name
    public string? Attribute2Id { get; init; }
    public string? Attribute2Name { get; init; } // Optional: display name
    public bool ServiceNo { get; init; }
    public bool Imei1 { get; init; }
    public bool Imei2 { get; init; }
    // ────────────────────────────────────────────────────────
}

public class GetProductListProfile : Profile
{
    public GetProductListProfile()
    {
        CreateMap<Product, GetProductListDto>()
            .ForMember(dest => dest.UnitMeasureName,
                opt => opt.MapFrom(src => src.UnitMeasure != null ? src.UnitMeasure.Name : string.Empty))
            .ForMember(dest => dest.TaxName,
                opt => opt.MapFrom(src => src.Tax != null ? src.Tax.Name : string.Empty))
            .ForMember(dest => dest.ProductGroupName,
                opt => opt.MapFrom(src => src.ProductGroup != null ? src.ProductGroup.Name : string.Empty))
            // NEW MAPPINGS
            .ForMember(dest => dest.Attribute1Id,
                opt => opt.MapFrom(src => src.Attribute1Id))
            .ForMember(dest => dest.Attribute1Name,
                opt => opt.MapFrom(src => src.Attribute1 != null ? src.Attribute1.Name : string.Empty))
            .ForMember(dest => dest.Attribute2Id,
                opt => opt.MapFrom(src => src.Attribute2Id))
            .ForMember(dest => dest.Attribute2Name,
                opt => opt.MapFrom(src => src.Attribute2 != null ? src.Attribute2.Name : string.Empty))
            .ForMember(dest => dest.ServiceNo,
                opt => opt.MapFrom(src => src.ServiceNo))
            .ForMember(dest => dest.Imei1,
                opt => opt.MapFrom(src => src.Imei1))
            .ForMember(dest => dest.Imei2,
                opt => opt.MapFrom(src => src.Imei2));
    }
}

public class GetProductListResult
{
    public List<GetProductListDto>? Data { get; init; }
}

public class GetProductListRequest : IRequest<GetProductListResult>
{
    public string? WarehouseId { get; init; }
    public bool IsDeleted { get; init; } = false;
}

public class GetProductListHandler : IRequestHandler<GetProductListRequest, GetProductListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetProductListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetProductListResult> Handle(GetProductListRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Product
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Include(x => x.UnitMeasure)
            .Include(x => x.ProductGroup)
            .Include(x => x.Tax)
            // NEW INCLUDES — Critical for mapping names and edit form
            .Include(x => x.Attribute1)
            .Include(x => x.Attribute2)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.WarehouseId))
        {
            query = query.Where(x => x.WarehouseId == request.WarehouseId);
        }

        var entities = await query.ToListAsync(cancellationToken);
        var dtos = _mapper.Map<List<GetProductListDto>>(entities);
        return new GetProductListResult { Data = dtos };
    }
}

// Optional: Keep this for inventory-specific lists (unchanged except includes)
public class GetInventoryProductListHandler : IRequestHandler<GetInventoryProductListRequest, GetProductListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetInventoryProductListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetProductListResult> Handle(GetInventoryProductListRequest request, CancellationToken cancellationToken)
    {
        var query = _context.Product
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Include(x => x.UnitMeasure)
            .Include(x => x.ProductGroup)
            .Include(x => x.Tax)
            .Include(x => x.Attribute1)
            .Include(x => x.Attribute2)
            .AsQueryable();

        if (!string.IsNullOrEmpty(request.WarehouseId))
        {
            query = query.Where(x => x.WarehouseId == request.WarehouseId &&
                                     _context.InventoryTransaction.Any(it =>
                                         it.ProductId == x.Id && it.WarehouseId == request.WarehouseId));
        }
        else
        {
            query = query.Where(x => _context.InventoryTransaction.Any(it => it.ProductId == x.Id));
        }

        var entities = await query.ToListAsync(cancellationToken);
        var dtos = _mapper.Map<List<GetProductListDto>>(entities);
        return new GetProductListResult { Data = dtos };
    }
}

public class GetInventoryProductListRequest : IRequest<GetProductListResult>
{
    public string? WarehouseId { get; init; }
    public bool IsDeleted { get; init; } = false;
}

// ────────────────────── PLU CODE HANDLER ──────────────────────
public record GetProductIdByPLUResult
{
    public string? ProductId { get; init; }
    // Simplified: Only ProductId returned
}

public class GetProductIdByPLURequest : IRequest<GetProductIdByPLUResult>
{
    public int Plu { get; init; }

    public GetProductIdByPLURequest()
    {
        // Parameterless constructor for DI validation
    }

    public GetProductIdByPLURequest(int plu)
    {
        Plu = plu;
    }
}
public class GetProductIdByPLUHandler : IRequestHandler<GetProductIdByPLURequest, GetProductIdByPLUResult>
{
    private readonly IQueryContext _context;

    public GetProductIdByPLUHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetProductIdByPLUResult> Handle(GetProductIdByPLURequest request, CancellationToken cancellationToken)
    {
        // Query ProductPluCodes for the PLU (assuming PluCode is int and unique)
        var pluRecord = await _context.ProductPluCodes
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .FirstOrDefaultAsync(x => x.PluCode == request.Plu, cancellationToken);

        if (pluRecord == null)
        {
            return new GetProductIdByPLUResult(); // Null ProductId indicates not found
        }

        return new GetProductIdByPLUResult
        {
            ProductId = pluRecord.ProductId
        };
    }
}

public class ProductStockSummaryDto
{
    public string ProductId { get; set; } = null!;
    public decimal TotalStock { get; set; }
    public decimal TotalMovement { get; set; }
    public decimal RequestStock { get; set; }

    public List<ProductStockAttributeDto> Attributes { get; set; } = new();
}

public class ProductStockAttributeDto
{
    public string? Attribute1DetailId { get; set; }
    public string? Attribute2DetailId { get; set; }

    public string? IMEI1 { get; set; }
    public string? IMEI2 { get; set; }
    public string? ServiceNo { get; set; }

    public decimal Quantity { get; set; }
}
public class GetProductStockByProductIdRequest
    : IRequest<ProductStockSummaryDto?>
{
    public string ProductId { get; init; } = null!;
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
    public string warehouseId { get; init; }
}

public class GetProductStockByProductIdHandler
    : IRequestHandler<GetProductStockByProductIdRequest, ProductStockSummaryDto?>
{
    private readonly IQueryContext _context;

    public GetProductStockByProductIdHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<ProductStockSummaryDto?> Handle(
        GetProductStockByProductIdRequest request,
        CancellationToken cancellationToken)
    {
        var result = await
        (
            from it in _context.InventoryTransaction
                .AsNoTracking()
                .ApplyIsDeletedFilter(false)

            join itad in _context.InventoryTransactionAttributesDetails
                .AsNoTracking()
                .ApplyIsDeletedFilter(false)
                on it.Id equals itad.InventoryTransactionId

            join grid in _context.GoodsReceiveItemDetails
                .AsNoTracking()
                on itad.GoodsReceiveItemDetailsId equals grid.Id

            join gri in _context.GoodsReceiveItem
                .AsNoTracking()
                on grid.GoodsReceiveItemId equals gri.Id

            where it.Status == InventoryTransactionStatus.Confirmed
                   && it.WarehouseId == request.warehouseId
                  && it.ProductId == request.ProductId
          // 🔥 EXACT MATCH USING ANY ONE IDENTIFIER
          && (
                (!string.IsNullOrEmpty(request.IMEI1) && grid.IMEI1 == request.IMEI1)
             || (!string.IsNullOrEmpty(request.IMEI2) && grid.IMEI2 == request.IMEI2)
             || (!string.IsNullOrEmpty(request.ServiceNo) && grid.ServiceNo == request.ServiceNo)
          )

            group new { it, gri, grid } by it.ProductId into g

            select new ProductStockSummaryDto
            {
                ProductId = g.Key!,

                TotalStock = g
                    .GroupBy(x => new
                    {
                        x.grid.IMEI1,
                        x.grid.IMEI2,
                        x.grid.ServiceNo
                    })
                    .Count(ig => ig.Sum(x => x.it.Movement ?? 0) > 0),

                TotalMovement = g.Sum(x => (decimal)(x.it.Movement ?? 0)),
                RequestStock = 0,

                Attributes =
                    g.GroupBy(x => new
                    {
                        x.gri.Attribute1DetailId,
                        x.gri.Attribute2DetailId,
                        x.grid.IMEI1,
                        x.grid.IMEI2,
                        x.grid.ServiceNo
                    })
                    .Select(ag => new ProductStockAttributeDto
                    {
                        Attribute1DetailId = ag.Key.Attribute1DetailId,
                        Attribute2DetailId = ag.Key.Attribute2DetailId,
                        IMEI1 = ag.Key.IMEI1,
                        IMEI2 = ag.Key.IMEI2,
                        ServiceNo = ag.Key.ServiceNo,
                        Quantity = ag.Sum(x => (decimal)(x.it.Movement ?? 0))
                    })
                    .Where(a => a.Quantity > 0)
                    .ToList()
            }
        )
        .Where(x => x.TotalStock > 0)
        .FirstOrDefaultAsync(cancellationToken);

        return result;
    }
}
public class ProductPluCodeDto
{
    public string Id { get; set; } = string.Empty;
    public string? ProductId { get; set; }
    public string? Attribute1DetailId { get; set; }
    public string? Attribute2DetailId { get; set; }
    public int PluCode { get; set; }
}
public class GetProductPluCodesQuery : IRequest<List<ProductPluCodeDto>>
{
}

public class GetProductPluCodesHandler
    : IRequestHandler<GetProductPluCodesQuery, List<ProductPluCodeDto>>
{
    private readonly IQueryContext _queryContext;

    public GetProductPluCodesHandler(IQueryContext queryContext)
    {
        _queryContext = queryContext;
    }

    public async Task<List<ProductPluCodeDto>> Handle(
        GetProductPluCodesQuery request,
        CancellationToken ct)
    {
        return await _queryContext.ProductPluCodes
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .OrderBy(x => x.PluCode)
            .Select(x => new ProductPluCodeDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                Attribute1DetailId = x.Attribute1DetailId,
                Attribute2DetailId = x.Attribute2DetailId,
                PluCode = x.PluCode
            })
            .ToListAsync(ct);
    }
}








