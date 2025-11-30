using Application.Common.CQS.Queries;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace Application.Features.GoodsReceiveManager.Queries
{
    // =========================
    // DTOs
    // =========================
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

        // Selected attribute ids for the row (optional)
        public string? Attribute1DetailId { get; init; }
        public string? Attribute2DetailId { get; init; }

        // Dropdown lists for each attribute (UI expects id/value pairs)
        public List<AttributeDetailDto>? Attribute1List { get; init; } = new();
        public List<AttributeDetailDto>? Attribute2List { get; init; } = new();

        // Item-level IMEI / service details
        public List<GoodsReceiveItemDetailDto> Attributes { get; init; } = new();
    }
    public class GoodsReceiveItemDetailDto
    {
        public int RowIndex { get; set; }
        public string? IMEI1 { get; set; }
        public string? IMEI2 { get; set; }
        public string? ServiceNo { get; set; }
    }
   

    public class AttributeDetailDto
    {
        public string? Id { get; set; }
        public string? Value { get; set; }
    }

    // =========================
    // Request & Result
    // =========================
    public class GetGoodsReceiveItemListRequest : IRequest<GetGoodsReceiveItemListResult>
    {
        public string GoodsReceiveId { get; set; } = string.Empty;
    }

    public class GetGoodsReceiveItemListResult
    {
        public List<GetGoodsReceiveItemListDto> Data { get; init; } = new();
    }

    // =========================
    // AutoMapper Profile (optional — we use manual mapping in handler for full control)
    // =========================
    public class GetGoodsReceiveItemListProfile : Profile
    {
        public GetGoodsReceiveItemListProfile()
        {
            CreateMap<GoodsReceiveItemDetails, GoodsReceiveItemDetailDto>()
                .ForMember(d => d.RowIndex, opt => opt.MapFrom(s => s.RowIndex))
                .ForMember(d => d.IMEI1, opt => opt.MapFrom(s => s.IMEI1))
                .ForMember(d => d.IMEI2, opt => opt.MapFrom(s => s.IMEI2))
                .ForMember(d => d.ServiceNo, opt => opt.MapFrom(s => s.ServiceNo));
        }
    }

    // =========================
    // Handler
    // =========================
    public class GetGoodsReceiveItemListHandler : IRequestHandler<GetGoodsReceiveItemListRequest, GetGoodsReceiveItemListResult>
    {
        private readonly IMapper _mapper;
        private readonly IQueryContext _context;

        public GetGoodsReceiveItemListHandler(IMapper mapper, IQueryContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        //public async Task<GetGoodsReceiveItemListResult> Handle(GetGoodsReceiveItemListRequest request, CancellationToken cancellationToken)
        //{
        //    // Load items with PO item + product + item details
        //    var items = await _context.GoodsReceiveItem
        //        .AsNoTracking()
        //        .Include(x => x.PurchaseOrderItem)
        //            .ThenInclude(poi => poi.Product)
        //        .Include(x => x.Attributes)    // GoodsReceiveItemDetails navigation
        //        .Where(x => x.GoodsReceiveId == request.GoodsReceiveId && !x.IsDeleted)
        //        .ToListAsync(cancellationToken);

        //    // Preload distinct product ids used in items to fetch attribute lists efficiently
        //    var productIds = items
        //        .Select(i => i.PurchaseOrderItem?.ProductId) // fallback
        //        .Where(id => !string.IsNullOrEmpty(id))
        //        .Distinct()
        //        .ToList();

        //    // Dictionary productId -> (attribute1List, attribute2List)
        //    var productAttrMap = new Dictionary<string, (List<AttributeDetailDto> attr1, List<AttributeDetailDto> attr2)>(StringComparer.OrdinalIgnoreCase);

        //    if (productIds.Count > 0)
        //    {
        //        // Fetch products with attribute metadata (attribute1Id/attribute2Id) in one query
        //        var products = await _context.Product
        //            .AsNoTracking()
        //            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
        //            .Select(p => new
        //            {
        //                p.Id,
        //                p.Attribute1Id, // change if your property name differs
        //                p.Attribute2Id
        //            })
        //            .ToListAsync(cancellationToken);

        //        // For each product, load attribute details lists if attribute ids present
        //        foreach (var prod in products)
        //        {
        //            var list1 = new List<AttributeDetailDto>();
        //            var list2 = new List<AttributeDetailDto>();

        //            if (!string.IsNullOrEmpty(prod.Attribute1Id))
        //            {
        //                // ASSUMPTION: you have a DbSet<AttributeDetail> or similar which stores detail records for an attribute definition.
        //                // Adjust the DbSet name / query below to match your schema:
        //                // e.g. _context.AttributeDetail, _context.ProductAttributeValues, etc.
        //                var details1 = await _context.AttributeDetail
        //                    .AsNoTracking()
        //                    .Where(a => a.AttributeId == prod.Attribute1Id && !a.IsDeleted)
        //                    .Select(a => new AttributeDetailDto { Id = a.Id, Value = a.Value })
        //                    .ToListAsync(cancellationToken);

        //                list1.AddRange(details1);
        //            }

        //            if (!string.IsNullOrEmpty(prod.Attribute2Id))
        //            {
        //                var details2 = await _context.AttributeDetail
        //                    .AsNoTracking()
        //                    .Where(a => a.AttributeId == prod.Attribute2Id && !a.IsDeleted)
        //                    .Select(a => new AttributeDetailDto { Id = a.Id, Value = a.Value })
        //                    .ToListAsync(cancellationToken);

        //                list2.AddRange(details2);
        //            }

        //            productAttrMap[prod.Id] = (list1, list2);
        //        }
        //    }

        //    // Map items -> DTOs
        //    var dtoList = items.Select(x =>
        //    {
        //        var poItem = x.PurchaseOrderItem;
        //        var orderedQty = poItem?.Quantity ?? 0;
        //        var totalReceivedQty = poItem?.ReceivedQuantity ?? 0;
        //        var remainingQty = orderedQty - totalReceivedQty;
        //        if (remainingQty < 0) remainingQty = 0;

        //        // find product id (prefer the product id from PO item)
        //        var productId = poItem?.ProductId ?? x.PurchaseOrderItem?.ProductId;

        //        // get preloaded attribute lists (safe)
        //        productAttrMap.TryGetValue(productId ?? string.Empty, out var attrLists);

        //        return new GetGoodsReceiveItemListDto
        //        {
        //            Id = x.Id,
        //            GoodsReceiveId = x.GoodsReceiveId,
        //            PurchaseOrderItemId = x.PurchaseOrderItemId,
        //            ProductId = productId,
        //            ProductName = poItem?.Product?.Name,
        //            ProductNumber = poItem?.Product?.Number,
        //            ActualQuantity = orderedQty,
        //            RemainingQuantity = remainingQty,
        //            ReceivedQuantity = x.ReceivedQuantity,
        //            UnitPrice = x.UnitPrice,
        //            TaxAmount = x.TaxAmount,
        //            FinalUnitPrice = x.FinalUnitPrice,
        //            MRP = x.MRP,
        //            Notes = x.Notes,
        //            CreatedAtUtc = x.CreatedAtUtc,
        //            Attribute1DetailId = x.Attribute1DetailId,
        //            Attribute2DetailId = x.Attribute2DetailId,
        //            Attribute1List = attrLists.attr1 ?? new List<AttributeDetailDto>(),
        //            Attribute2List = attrLists.attr2 ?? new List<AttributeDetailDto>(),

        //            Attributes = (x.Attributes ?? new List<GoodsReceiveItemDetails>()).Select(d => new GoodsReceiveItemDetailDto
        //            {
        //                RowIndex = d.RowIndex,
        //                IMEI1 = d.IMEI1,
        //                IMEI2 = d.IMEI2,
        //                ServiceNo = d.ServiceNo
        //            }).ToList()
        //        };
        //    }).ToList();

        //    return new GetGoodsReceiveItemListResult
        //    {
        //        Data = dtoList
        //    };
        //}

        public async Task<GetGoodsReceiveItemListResult> Handle(GetGoodsReceiveItemListRequest request, CancellationToken cancellationToken)
        {
            // -----------------------------
            // 1️⃣ Load GR Items + Product
            // -----------------------------
            var items = await _context.GoodsReceiveItem
                .AsNoTracking()
                .Include(x => x.PurchaseOrderItem)
                    .ThenInclude(poi => poi.Product)
                .Include(x => x.Attributes)
                .Where(x => x.GoodsReceiveId == request.GoodsReceiveId && !x.IsDeleted)
                .ToListAsync(cancellationToken);

            // -----------------------------
            // 2️⃣ Collect product IDs
            // -----------------------------
            var productIds = items
                .Select(i => i.PurchaseOrderItem.ProductId)
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToList();

            if (productIds.Count == 0)
                return new GetGoodsReceiveItemListResult { Data = new List<GetGoodsReceiveItemListDto>() };

            // -----------------------------
            // 3️⃣ Load Products with Attribute1Id / Attribute2Id
            // -----------------------------
            var products = await _context.Product
                .AsNoTracking()
                .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Number,
                    p.Attribute1Id,
                    p.Attribute2Id
                })
                .ToListAsync(cancellationToken);

            // -----------------------------
            // 4️⃣ Collect ALL unique AttributeIds (1 & 2)
            // -----------------------------
            var attributeIds = products
                .SelectMany(p => new[] { p.Attribute1Id, p.Attribute2Id })
                .Where(id => !string.IsNullOrEmpty(id))
                .Distinct()
                .ToList();

            // -----------------------------
            // 5️⃣ Load ALL AttributeDetails in ONE batch
            // -----------------------------
            // 5️⃣ Load ALL AttributeDetails in ONE batch (internal AttributeId required)
            var attributeDetailsInternal = await _context.AttributeDetail
                .AsNoTracking()
                .Where(a => attributeIds.Contains(a.AttributeId) && !a.IsDeleted)
                .Select(a => new
                {
                    Id = a.Id,
                    Value = a.Value,
                    AttributeId = a.AttributeId
                })
                .ToListAsync(cancellationToken);

            // 6️⃣ Group by AttributeId
            var attributeDetailsByAttributeId =
                attributeDetailsInternal
                    .GroupBy(a => a.AttributeId)
                    .ToDictionary(g => g.Key,
                        g => g.Select(d => new AttributeDetailDto
                        {
                            Id = d.Id,
                            Value = d.Value
                        }).ToList()
                    );


            // -----------------------------
            // 7️⃣ Build mapping per product
            // -----------------------------
            var productAttrMap = new Dictionary<string, (List<AttributeDetailDto> a1, List<AttributeDetailDto> a2)>();

            foreach (var p in products)
            {
                var attr1List = (p.Attribute1Id != null && attributeDetailsByAttributeId.ContainsKey(p.Attribute1Id))
                    ? attributeDetailsByAttributeId[p.Attribute1Id]
                    : new List<AttributeDetailDto>();

                var attr2List = (p.Attribute2Id != null && attributeDetailsByAttributeId.ContainsKey(p.Attribute2Id))
                    ? attributeDetailsByAttributeId[p.Attribute2Id]
                    : new List<AttributeDetailDto>();

                productAttrMap[p.Id] = (attr1List, attr2List);
            }

            // -----------------------------
            // 8️⃣ Build DTO output (fast)
            // -----------------------------
            var dtoList = items.Select(x =>
            {
                var poItem = x.PurchaseOrderItem;
                var product = poItem.Product;

                var orderedQty = poItem.Quantity ?? 0;
                var totalReceivedQty = poItem.ReceivedQuantity ;
                var remainingQty = Math.Max(0, orderedQty - totalReceivedQty);

                productAttrMap.TryGetValue(product.Id, out var attrLists);

                return new GetGoodsReceiveItemListDto
                {
                    Id = x.Id,
                    GoodsReceiveId = x.GoodsReceiveId,
                    PurchaseOrderItemId = x.PurchaseOrderItemId,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ProductNumber = product.Number,
                    ActualQuantity = orderedQty,
                    RemainingQuantity = remainingQty,
                    ReceivedQuantity = x.ReceivedQuantity,
                    UnitPrice = x.UnitPrice,
                    TaxAmount = x.TaxAmount,
                    FinalUnitPrice = x.FinalUnitPrice,
                    MRP = x.MRP,
                    Notes = x.Notes,
                    CreatedAtUtc = x.CreatedAtUtc,

                    Attribute1DetailId = x.Attribute1DetailId,
                    Attribute2DetailId = x.Attribute2DetailId,

                    // ⭐ Optimized attribute lists
                    Attribute1List = attrLists.a1,
                    Attribute2List = attrLists.a2,

                    // IMEI / Service No details
                    Attributes = x.Attributes.Select(d => new GoodsReceiveItemDetailDto
                    {
                        RowIndex = d.RowIndex,
                        IMEI1 = d.IMEI1,
                        IMEI2 = d.IMEI2,
                        ServiceNo = d.ServiceNo
                    }).ToList()
                };
            }).ToList();

            return new GetGoodsReceiveItemListResult { Data = dtoList };
        }

    }
}
