using Application.Common.CQS.Queries;
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
    public string? Name { get; init; }
    public string? Description { get; init; }
    public double? UnitPrice { get; init; }
    public bool? Physical { get; init; } = true;
    public string? UnitMeasureId { get; init; }
    public string? ProductGroupId { get; init; }
    public string? WarehouseId { get; init; }  // added
    public string? UpdatedById { get; init; }
    public string? TaxId { get; set; }

}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.UnitPrice).NotEmpty();
        RuleFor(x => x.Physical).NotEmpty();
        RuleFor(x => x.UnitMeasureId).NotEmpty();
        RuleFor(x => x.ProductGroupId).NotEmpty();
        RuleFor(x => x.TaxId).NotEmpty();

    }
}

public class UpdateProductHandler : IRequestHandler<UpdateProductRequest, UpdateProductResult>
{
    private readonly ICommandRepository<Product> _repository;
    private readonly ICommandRepository<ProductPriceDefinition> _priceRepository;
    private readonly IQueryContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;


    public UpdateProductHandler(
        ICommandRepository<Product> repository,
        ICommandRepository<ProductPriceDefinition> priceRepository,
        IQueryContext context,
        IUnitOfWork unitOfWork,
           ISecurityService securityService

    )
    {
        _repository = repository;
        _priceRepository = priceRepository;
        _context = context;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
    }

    public async Task<UpdateProductResult> Handle(UpdateProductRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        { 
            throw new Exception("Product not found");
        }

        // Step 2: Update product
        
        entity.UpdatedById = request.UpdatedById;

        entity.Name = request.Name;
        entity.UnitPrice = request.UnitPrice;
        entity.Physical = request.Physical;
        entity.Description = request.Description;
        entity.UnitMeasureId = request.UnitMeasureId;
        entity.ProductGroupId = request.ProductGroupId;
        entity.WarehouseId = request.WarehouseId;

        entity.TaxId = request.TaxId;
        _repository.Update(entity);

        // Step 3: Save product update
        await _unitOfWork.SaveAsync(cancellationToken);

        var priceDef = await _context.ProductPriceDefinition
     .FirstOrDefaultAsync(x => x.ProductId == entity.Id, cancellationToken);


        // Step 5: Create if not exists
        if (priceDef == null)
        {
            priceDef = new ProductPriceDefinition
            {
                ProductId = entity.Id,
                ProductName = entity.Name,
                CostPrice = Convert.ToDecimal(entity.UnitPrice ?? 0),
                MarginPercentage = 10,
                CurrencyCode = "INR",
                //SalePrice = 0, // will be computed by DB
                EffectiveFrom = _securityService.ConvertToIst(DateTime.UtcNow),
                 //EffectiveTo = null,
                IsActive = true,
                CreatedById = request.UpdatedById,
            };

            await _priceRepository.CreateAsync(priceDef, cancellationToken);
        }
        else
        {
            // Step 6: Update existing Price Definition
            priceDef.CostPrice = Convert.ToDecimal(entity.UnitPrice ?? 0);
            priceDef.UpdatedById = request.UpdatedById;
            _priceRepository.Update(priceDef);
        }

        // Step 7: Save in same transaction
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductResult
        {
            Data = entity
        };
    }
}

