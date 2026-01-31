using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Commands
{
    public class CreateProductResult
    {
        public Product? Data { get; set; }
    }

    public class CreateProductRequest : IRequest<CreateProductResult>
    {
        public string? Number { get; init; }
        public string? Name { get; init; }
        public string? HsnCode { get; init; }
        public string? TaxType { get; init; }
        public string? Description { get; init; }
        public double? UnitPrice { get; init; }
        public bool Physical { get; init; } = true;
        public string? UnitMeasureId { get; init; }
        public string? ProductGroupId { get; init; }
        public string? WarehouseId { get; init; }
        public string? CreatedById { get; init; }
        public string? TaxId { get; set; }

        // NEW FIELDS
        public string? Attribute1Id { get; init; }
        public string? Attribute2Id { get; init; }
        public bool ServiceNo { get; init; } = false;
        public bool Imei1 { get; init; } = false;
        public bool Imei2 { get; init; } = false;
    }

    public class CreateProductValidator : AbstractValidator<CreateProductRequest>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
            RuleFor(x => x.UnitPrice).NotNull().GreaterThan(0);
            RuleFor(x => x.UnitMeasureId).NotEmpty();
            RuleFor(x => x.ProductGroupId).NotEmpty();
            RuleFor(x => x.TaxId).NotEmpty();
            RuleFor(x => x.WarehouseId).NotEmpty();
            RuleFor(x => x.HsnCode).NotEmpty();
            RuleFor(x => x.TaxType).NotEmpty();
        }
    }

    public class CreateProductHandler : IRequestHandler<CreateProductRequest, CreateProductResult>
    {
        private readonly ICommandRepository<Product> _productRepository;
        private readonly ICommandRepository<ProductPriceDefinition> _priceRepository;
        private readonly ICommandRepository<ProductPluCodes> _variantRepository;
        private readonly ICommandRepository<AttributeDetail> _attributeDetailReadRepository;

        private readonly IUnitOfWork _unitOfWork;
        private readonly NumberSequenceService _numberSequenceService;
        private readonly ISecurityService _securityService;

        public CreateProductHandler(
            ICommandRepository<Product> productRepository,
            ICommandRepository<ProductPriceDefinition> priceRepository,
            ICommandRepository<ProductPluCodes> variantRepository,
            ICommandRepository<AttributeDetail> attributeDetailReadRepository,
            IUnitOfWork unitOfWork,
            NumberSequenceService numberSequenceService,
            ISecurityService securityService)
        {
            _productRepository = productRepository;
            _priceRepository = priceRepository;
            _variantRepository = variantRepository;
            _attributeDetailReadRepository = attributeDetailReadRepository;
            _unitOfWork = unitOfWork;
            _numberSequenceService = numberSequenceService;
            _securityService = securityService;
        }

        public async Task<CreateProductResult> Handle(CreateProductRequest request, CancellationToken cancellationToken)
        {
            // ✅ Step 1: Create Product
            var product = new Product
            {
                Number = string.IsNullOrWhiteSpace(request.Number)
                    ? _numberSequenceService.GenerateNumber(nameof(Product), "", "ART")
                    : request.Number,
                Name = request.Name!,
                HsnCode =request.HsnCode,
                TaxType = request.TaxType,
                Description = request.Description,
                UnitPrice = request.UnitPrice ?? 0,
                Physical = request.Physical,
                UnitMeasureId = request.UnitMeasureId!,
                ProductGroupId = request.ProductGroupId!,
                WarehouseId = request.WarehouseId!,
                TaxId = request.TaxId!,
                CreatedById = request.CreatedById!,
                CreatedAtUtc = DateTime.UtcNow,
                Attribute1Id = request.Attribute1Id,
                Attribute2Id = request.Attribute2Id,
                ServiceNo = request.ServiceNo,
                Imei1 = request.Imei1,
                Imei2 = request.Imei2
            };

            await _productRepository.CreateAsync(product, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // ✅ Step 2: Price Definition
            var priceDef = new ProductPriceDefinition
            {
                ProductId = product.Id,
                ProductName = product.Name,
                CostPrice = Convert.ToDecimal(product.UnitPrice ?? 0),
                MarginPercentage = 10,
                CurrencyCode = "INR",
                EffectiveFrom = DateTime.Now,
                IsActive = true,
                CreatedById = request.CreatedById
            };

            await _priceRepository.CreateAsync(priceDef, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // ✅ Step 3: Load Attribute Details
            var attribute1Details = await _attributeDetailReadRepository
                .GetQuery()
                .Where(x => x.AttributeId == request.Attribute1Id)
                .ApplyIsDeletedFilter(false)
                .ToListAsync(cancellationToken);

            var attribute2Details = await _attributeDetailReadRepository
                .GetQuery()
                .Where(x => x.AttributeId == request.Attribute2Id)
                .ApplyIsDeletedFilter(false)
                .ToListAsync(cancellationToken);

            // -------------------------
            //   🚀 CASE 1: BOTH exist  
            // -------------------------
            if (attribute1Details.Any() && attribute2Details.Any())
            {
                foreach (var a1 in attribute1Details)
                {
                    foreach (var a2 in attribute2Details)
                    {
                        var record = new ProductPluCodes
                        {
                            ProductId = product.Id,
                            Attribute1DetailId = a1.Id,
                            Attribute2DetailId = a2.Id,
                            // PluCode auto-generated by DB sequence
                            CreatedById = request.CreatedById
                        };

                        await _variantRepository.CreateAsync(record, cancellationToken);
                    }
                }

                await _unitOfWork.SaveAsync(cancellationToken);
            }
            // -------------------------
            //   🚀 CASE 2: ONLY A1 exists  
            // -------------------------
            else if (attribute1Details.Any() && !attribute2Details.Any())
            {
                foreach (var a1 in attribute1Details)
                {
                    var record = new ProductPluCodes
                    {
                        ProductId = product.Id,
                        Attribute1DetailId = a1.Id,
                        Attribute2DetailId = null,     // No second attribute
                        CreatedById = request.CreatedById
                    };

                    await _variantRepository.CreateAsync(record, cancellationToken);
                }

                await _unitOfWork.SaveAsync(cancellationToken);
            }
            // -------------------------
            //   🚀 CASE 3: ONLY A2 exists  
            // -------------------------
            else if (!attribute1Details.Any() && attribute2Details.Any())
            {
                foreach (var a2 in attribute2Details)
                {
                    var record = new ProductPluCodes
                    {
                        ProductId = product.Id,
                        Attribute1DetailId = null,
                        Attribute2DetailId = a2.Id,
                        CreatedById = request.CreatedById
                    };

                    await _variantRepository.CreateAsync(record, cancellationToken);
                }

                await _unitOfWork.SaveAsync(cancellationToken);
            }
            // -------------------------
            //   🚫 CASE 4: None exist  
            // -------------------------
            // Do nothing

            return new CreateProductResult
            {
                Data = product
            };
        }
    }
}
