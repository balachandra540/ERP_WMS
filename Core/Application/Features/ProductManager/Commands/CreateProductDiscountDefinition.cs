using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Commands;

#region ===== RESULT =====

public class CreateProductDiscountDefinitionResult
{
    public ProductDiscountDefinition? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class CreateProductDiscountDefinitionRequest
    : IRequest<CreateProductDiscountDefinitionResult>
{
    public string ProductId { get; init; } = default!;

    public string DiscountName { get; init; } = default!;
    public string DiscountType { get; init; } = default!;   // Flat / Upto

    public decimal DiscountPercentage { get; init; }
    public decimal? MaxDiscountAmount { get; init; }

    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }

    public bool IsActive { get; init; }
    public string? CreatedById { get; init; }
}

#endregion

#region ===== VALIDATOR =====

public class CreateProductDiscountDefinitionValidator
    : AbstractValidator<CreateProductDiscountDefinitionRequest>
{
    public CreateProductDiscountDefinitionValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty();

        RuleFor(x => x.DiscountName)
            .NotEmpty();

        RuleFor(x => x.DiscountType)
            .NotEmpty()
            .Must(x => x == "Flat" || x == "Upto")
            .WithMessage("DiscountType must be Flat or Upto.");

        RuleFor(x => x.DiscountPercentage)
            .GreaterThan(0)
            .LessThanOrEqualTo(100);

        RuleFor(x => x.MaxDiscountAmount)
            .GreaterThan(0)
            .When(x => x.DiscountType == "Upto")
            .WithMessage("MaxDiscountAmount is required for Upto discount.");

        RuleFor(x => x.EffectiveFrom)
            .NotEmpty();
    }
}

#endregion

#region ===== HANDLER =====

public class CreateProductDiscountDefinitionHandler
    : IRequestHandler<CreateProductDiscountDefinitionRequest, CreateProductDiscountDefinitionResult>
{
    private readonly ICommandRepository<ProductDiscountDefinition> _repository;
    private readonly ICommandRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _security;

    public CreateProductDiscountDefinitionHandler(
        ICommandRepository<ProductDiscountDefinition> repository,
        ICommandRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        ISecurityService security)
    {
        _repository = repository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _security = security;
    }

    public async Task<CreateProductDiscountDefinitionResult> Handle(
        CreateProductDiscountDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        // ✅ Read Product using ICommandRepository
        var product = await _productRepository
            .GetQuery()
            .AsNoTracking()
            .Where(x => x.Id == request.ProductId)
            .Select(x => new { x.Id, x.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            throw new ValidationException("Invalid Product selected.");

        var entity = new ProductDiscountDefinition
        {
            ProductId = product.Id,
            ProductName = product.Name,

            DiscountName = request.DiscountName,
            DiscountType = request.DiscountType,
            DiscountPercentage = request.DiscountPercentage,
            MaxDiscountAmount = request.DiscountType == "Upto"
                ? request.MaxDiscountAmount
                : null,

            EffectiveFrom = _security.ConvertToIst(request.EffectiveFrom),
            EffectiveTo = _security.ConvertToIst(request.EffectiveTo),

            IsActive = request.IsActive,
            CreatedById = request.CreatedById
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateProductDiscountDefinitionResult
        {
            Data = entity
        };
    }
}

#endregion
