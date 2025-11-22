//using Application.Common.Extensions;
//using Application.Common.Repositories;
//using Application.Common.Services.SecurityManager;
//using Domain.Entities;
//using FluentValidation;
//using MediatR;
//using Microsoft.EntityFrameworkCore;

//namespace Application.Features.ProductManager.Commands;

//public class UpdateProductResult
//{
//    public Product? Data { get; set; }
//}

//public class UpdateProductRequest : IRequest<UpdateProductResult>
//{
//    public string? Id { get; init; }
//    public string? Number { get; init; }
//    public string? Name { get; init; }
//    public string? Description { get; init; }
//    public double? UnitPrice { get; init; }
//    public bool Physical { get; init; } = true;
//    public string? UnitMeasureId { get; init; }
//    public string? ProductGroupId { get; init; }
//    public string? WarehouseId { get; init; }
//    public string? UpdatedById { get; init; }
//    public string? TaxId { get; set; }

//    // NEW FIELDS
//    public string? Attribute1Id { get; init; }
//    public string? Attribute2Id { get; init; }
//    public bool ServiceNo { get; init; } = false;
//    public bool Imei1 { get; init; } = false;
//    public bool Imei2 { get; init; } = false;
//}

//public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
//{

//    public UpdateProductValidator()
//    {
//        RuleFor(x => x.Id).NotEmpty();
//        RuleFor(x => x.Name).NotEmpty();
//        RuleFor(x => x.UnitPrice).NotNull().GreaterThan(0);
//        RuleFor(x => x.UnitMeasureId).NotEmpty();
//        RuleFor(x => x.ProductGroupId).NotEmpty();
//        RuleFor(x => x.TaxId).NotEmpty();
//    }
//}

//public class UpdateProductHandler : IRequestHandler<UpdateProductRequest, UpdateProductResult>
//{
//    private readonly ICommandRepository<Product> _productRepository;
//    private readonly ICommandRepository<ProductPriceDefinition> _priceRepository;
//    private readonly ICommandRepository<ProductVariant> _variantRepository;
//    private readonly ICommandRepository<AttributeDetail> _attributeDetailRepository;
//    private readonly IUnitOfWork _unitOfWork;

//    public UpdateProductHandler(
//        ICommandRepository<Product> productRepository,
//        ICommandRepository<ProductPriceDefinition> priceRepository,
//        ICommandRepository<ProductVariant> variantRepository,
//        ICommandRepository<AttributeDetail> attributeDetailRepository,
//        IUnitOfWork unitOfWork)
//    {
//        _productRepository = productRepository;
//        _priceRepository = priceRepository;
//        _variantRepository = variantRepository;
//        _attributeDetailRepository = attributeDetailRepository;
//        _unitOfWork = unitOfWork;
//    }

//    public async Task<UpdateProductResult> Handle(UpdateProductRequest request, CancellationToken cancellationToken)
//    {
//        // 1. Load main product (no navigation properties → no EF mapping issues)
//        var product = await _productRepository.GetQuery()
//            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken)
//            ?? throw new KeyNotFoundException("Product not found.");

//        // 2. Load variants separately
//        var existingVariants = await _variantRepository.GetQuery()
//            .Where(v => v.ProductId == product.Id && !v.IsDeleted)
//            .ToListAsync(cancellationToken);

//        // 3. Load active price definitions separately
//        var priceDefinitions = await _priceRepository.GetQuery()
//            .Where(p => p.ProductId == product.Id && p.IsActive && !p.IsDeleted)
//            .OrderByDescending(p => p.EffectiveFrom)
//            .ToListAsync(cancellationToken);

//        var latestPriceDef = priceDefinitions.FirstOrDefault();

//        // Old vs New attributes comparison
//        var oldAttr1Id = product.Attribute1Id;
//        var oldAttr2Id = product.Attribute2Id;
//        var newAttr1Id = request.Attribute1Id;
//        var newAttr2Id = request.Attribute2Id;
//        var attributesChanged = oldAttr1Id != newAttr1Id || oldAttr2Id != newAttr2Id;

//        // Update main product fields
//        product.Name = request.Name!.Trim();
//        product.Description = request.Description;
//        product.UnitPrice = request.UnitPrice ?? 0;
//        product.Physical = request.Physical;
//        product.UnitMeasureId = request.UnitMeasureId!;
//        product.ProductGroupId = request.ProductGroupId!;
//        product.TaxId = request.TaxId!;
//        product.UpdatedById = request.UpdatedById;
//        product.Attribute1Id = newAttr1Id;
//        product.Attribute2Id = newAttr2Id;
//        product.ServiceNo = request.ServiceNo;
//        product.Imei1 = request.Imei1;
//        product.Imei2 = request.Imei2;

//        _productRepository.Update(product);

//        // Update latest active price definition
//        if (latestPriceDef != null)
//        {
//            latestPriceDef.ProductName = product.Name;
//            latestPriceDef.CostPrice = Convert.ToDecimal(product.UnitPrice);
//            latestPriceDef.UpdatedById = request.UpdatedById;
//            _priceRepository.Update(latestPriceDef);
//        }

//        // Helper: Load attribute details
//        async Task<List<AttributeDetail>> LoadDetails(string? attrId)
//        {
//            if (string.IsNullOrEmpty(attrId))
//                return new List<AttributeDetail>();

//            return await _attributeDetailRepository.GetQuery()
//                .Where(x => x.AttributeId == attrId && !x.IsDeleted)
//                .ToListAsync(cancellationToken);
//        }

//        // Helper: Generate all variant combinations
//        async Task GenerateVariantsAsync()
//        {
//            var attr1Details = await LoadDetails(newAttr1Id);
//            var attr2Details = await LoadDetails(newAttr2Id);

//            if (!attr1Details.Any() || !attr2Details.Any())
//                return;

//            foreach (var a1 in attr1Details)
//            {
//                foreach (var a2 in attr2Details)
//                {
//                    var pluCode = $"{product.Name}_{a1.Value}_{a2.Value}".Trim();

//                    var newVariant = new ProductVariant
//                    {
//                        ProductId = product.Id,
//                        Attribute1DetailId = a1.Id,
//                        Attribute2DetailId = a2.Id,
//                        PluCode = pluCode,
//                        CreatedById = request.UpdatedById,
//                        UpdatedById = request.UpdatedById,
//                        CreatedAtUtc = DateTime.UtcNow,
//                        UpdatedAtUtc = DateTime.UtcNow
//                    };

//                    await _variantRepository.CreateAsync(newVariant, cancellationToken);
//                }
//            }
//        }

//        // Variant Logic
//        if (attributesChanged)
//        {
//            // CASE 1: Attributes changed → delete all existing variants and regenerate
//            if (existingVariants.Any())
//            {
//                foreach (var variant in existingVariants)
//                {
//                    _variantRepository.Delete(variant);
//                }
//            }

//            if (!string.IsNullOrEmpty(newAttr1Id) && !string.IsNullOrEmpty(newAttr2Id))
//            {
//                await GenerateVariantsAsync();
//            }
//        }
//        else
//        {
//            // CASE 2: Attributes unchanged → generate only if missing
//            bool hasAttributes = !string.IsNullOrEmpty(newAttr1Id) && !string.IsNullOrEmpty(newAttr2Id);
//            bool hasNoVariants = !existingVariants.Any();

//            if (hasAttributes && hasNoVariants)
//            {
//                await GenerateVariantsAsync();
//            }
//        }

//        await _unitOfWork.SaveAsync(cancellationToken);

//        return new UpdateProductResult { Data = product };
//    }
//}


using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Commands;

public class UpdateProductResult
{
    public Product? Data { get; set; }
}

public class UpdateProductRequest : IRequest<UpdateProductResult>
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public double? UnitPrice { get; init; }
    public bool Physical { get; init; } = true;
    public string? UnitMeasureId { get; init; }
    public string? ProductGroupId { get; init; }
    public string? WarehouseId { get; init; }
    public string? UpdatedById { get; init; }
    public string? TaxId { get; set; }

    // NEW FIELDS
    public string? Attribute1Id { get; init; }
    public string? Attribute2Id { get; init; }
    public bool ServiceNo { get; init; } = false;
    public bool Imei1 { get; init; } = false;
    public bool Imei2 { get; init; } = false;
}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.UnitPrice).NotNull().GreaterThan(0);
        RuleFor(x => x.UnitMeasureId).NotEmpty();
        RuleFor(x => x.ProductGroupId).NotEmpty();
        RuleFor(x => x.TaxId).NotEmpty();
    }
}

public class UpdateProductHandler : IRequestHandler<UpdateProductRequest, UpdateProductResult>
{
    private readonly ICommandRepository<Product> _productRepository;
    private readonly ICommandRepository<ProductPriceDefinition> _priceRepository;
    private readonly ICommandRepository<ProductVariant> _variantRepository;
    private readonly ICommandRepository<AttributeDetail> _attributeDetailRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductHandler(
        ICommandRepository<Product> productRepository,
        ICommandRepository<ProductPriceDefinition> priceRepository,
        ICommandRepository<ProductVariant> variantRepository,
        ICommandRepository<AttributeDetail> attributeDetailRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _priceRepository = priceRepository;
        _variantRepository = variantRepository;
        _attributeDetailRepository = attributeDetailRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateProductResult> Handle(UpdateProductRequest request, CancellationToken cancellationToken)
    {
        // Now safe to use Include() — all relationships are properly configured!
        var product = await _productRepository.GetQuery()
            .Include(p => p.Variants)
            .Include(p => p.PriceDefinitions)
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Product not found.");

        // Track old attribute values
        var oldAttr1Id = product.Attribute1Id;
        var oldAttr2Id = product.Attribute2Id;
        var newAttr1Id = request.Attribute1Id;
        var newAttr2Id = request.Attribute2Id;
        var attributesChanged = oldAttr1Id != newAttr1Id || oldAttr2Id != newAttr2Id;

        // Update main product fields
        product.Name = request.Name!.Trim();
        product.Description = request.Description;
        product.UnitPrice = request.UnitPrice ?? 0;
        product.Physical = request.Physical;
        product.UnitMeasureId = request.UnitMeasureId!;
        product.ProductGroupId = request.ProductGroupId!;
        product.TaxId = request.TaxId!;
        product.UpdatedById = request.UpdatedById;
        product.Attribute1Id = newAttr1Id;
        product.Attribute2Id = newAttr2Id;
        product.ServiceNo = request.ServiceNo;
        product.Imei1 = request.Imei1;
        product.Imei2 = request.Imei2;

        _productRepository.Update(product);

        // Update latest active price definition
        var latestPriceDef = product.PriceDefinitions
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.EffectiveFrom)
            .FirstOrDefault();

        if (latestPriceDef != null)
        {
            latestPriceDef.ProductName = product.Name;
            latestPriceDef.CostPrice = Convert.ToDecimal(product.UnitPrice);
            latestPriceDef.UpdatedById = request.UpdatedById;
            _priceRepository.Update(latestPriceDef);
        }

        // Helper: Load attribute details
        async Task<List<AttributeDetail>> LoadDetails(string? attrId)
        {
            if (string.IsNullOrEmpty(attrId))
                return new List<AttributeDetail>();

            return await _attributeDetailRepository.GetQuery()
                .Where(x => x.AttributeId == attrId && !x.IsDeleted)
                .ToListAsync(cancellationToken);
        }

        // Helper: Generate variants
        async Task GenerateVariantsAsync()
        {
            var attr1Details = await LoadDetails(newAttr1Id);
            var attr2Details = await LoadDetails(newAttr2Id);

            if (!attr1Details.Any() || !attr2Details.Any())
                return;

            foreach (var a1 in attr1Details)
            {
                foreach (var a2 in attr2Details)
                {
                    var pluCode = $"{product.Name}_{a1.Value}_{a2.Value}".Trim();

                    var newVariant = new ProductVariant
                    {
                        ProductId = product.Id,
                        Attribute1DetailId = a1.Id,
                        Attribute2DetailId = a2.Id,
                        PluCode = pluCode,
                        CreatedById = request.UpdatedById,
                    };

                    await _variantRepository.CreateAsync(newVariant, cancellationToken);
                }
            }
        }

        // === Variant Management Logic ===
        if (attributesChanged)
        {
            // Attributes changed → delete all existing variants
            if (product.Variants.Any())
            {
                foreach (var variant in product.Variants.ToList())
                {
                    _variantRepository.Delete(variant);
                }
                product.Variants.Clear();
            }

            // Regenerate if both attributes are now set
            if (!string.IsNullOrEmpty(newAttr1Id) && !string.IsNullOrEmpty(newAttr2Id))
            {
                await GenerateVariantsAsync();
            }
        }
        else
        {
            // Attributes unchanged → generate only if missing and needed
            bool shouldHaveVariants = !string.IsNullOrEmpty(newAttr1Id) && !string.IsNullOrEmpty(newAttr2Id);
            bool hasNoVariants = !product.Variants.Any();

            if (shouldHaveVariants && hasNoVariants)
            {
                await GenerateVariantsAsync();
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductResult { Data = product };
    }
}
