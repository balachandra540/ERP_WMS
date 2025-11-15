using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using FluentValidation;
using MediatR;


namespace Application.Features.ProductManager.Commands;

public class CreateProductResult
{
    public Product? Data { get; set; }
}

public class CreateProductRequest : IRequest<CreateProductResult>
{
    public string? Number { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public double? UnitPrice { get; init; }
    public bool? Physical { get; init; } = true;
    public string? UnitMeasureId { get; init; }
    public string? ProductGroupId { get; init; }
    public string? WarehouseId { get; init; }
    public string? CreatedById { get; init; }
    public string? TaxId { get; set; }


}


public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.UnitPrice).NotEmpty();
        RuleFor(x => x.Physical).NotEmpty();
        RuleFor(x => x.UnitMeasureId).NotEmpty();
        RuleFor(x => x.ProductGroupId).NotEmpty();
        RuleFor(x => x.TaxId).NotEmpty();

    }
}

public class CreateProductHandler : IRequestHandler<CreateProductRequest, CreateProductResult>
{
    private readonly ICommandRepository<Product> _repository;
    private readonly ICommandRepository<ProductPriceDefinition> _priceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly ISecurityService _securityService;

    public CreateProductHandler(
        ICommandRepository<Product> repository,
        ICommandRepository<ProductPriceDefinition> priceRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
            ISecurityService securityService

    )
    {
        _repository = repository;
        _priceRepository = priceRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _securityService = securityService;
    }

    public async Task<CreateProductResult> Handle(CreateProductRequest request, CancellationToken cancellationToken = default)
    {
        // Step 1: Create Product
        var entity = new Product
        {
            CreatedById = request.CreatedById,
            Number = string.IsNullOrWhiteSpace(request.Number)
                ? _numberSequenceService.GenerateNumber(nameof(Product), "", "ART")
                : request.Number,
            Name = request.Name,
            UnitPrice = request.UnitPrice,
            Physical = request.Physical ?? true,
            Description = request.Description,
            UnitMeasureId = request.UnitMeasureId,
            ProductGroupId = request.ProductGroupId,
            WarehouseId = request.WarehouseId,
            TaxId = request.TaxId
        };

        await _repository.CreateAsync(entity, cancellationToken);

        // Save product first to get ID
        await _unitOfWork.SaveAsync(cancellationToken);

        // Step 2: Auto insert row into ProductPriceDefinition
        var priceDefinition = new ProductPriceDefinition
        {
            ProductId = entity.Id,
            ProductName = entity.Name,  
            CostPrice = Convert.ToDecimal(entity.UnitPrice ?? 0),
            MarginPercentage = 10,               // default % 
            //SalePrice = 0,                     // will be computed by DB
            CurrencyCode = "INR",
            EffectiveFrom = DateTime.UtcNow,
            // = _securityService.ConvertToIst(request.DeliveryDate),
            IsActive = true,
            CreatedById = request.CreatedById,
        };

        await _priceRepository.CreateAsync(priceDefinition, cancellationToken);

        // Save both product + price in same transaction
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateProductResult
        {
            Data = entity
        };
    }
}

