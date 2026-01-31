using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Commands;

#region ===== RESULT =====

public class UpdateProductDiscountDefinitionResult
{
    public ProductDiscountDefinition? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class UpdateProductDiscountDefinitionRequest
    : IRequest<UpdateProductDiscountDefinitionResult>
{
    public string Id { get; init; } = default!;
    public string ProductId { get; init; } = default!;

    public string DiscountName { get; init; } = default!;
    public string DiscountType { get; init; } = default!; // Flat / Upto

    public decimal DiscountPercentage { get; init; }
    public decimal? MaxDiscountAmount { get; init; }

    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }

    public bool IsActive { get; init; }
    public string? UpdatedById { get; init; }
}

#endregion

#region ===== VALIDATOR =====

public class UpdateProductDiscountDefinitionValidator
    : AbstractValidator<UpdateProductDiscountDefinitionRequest>
{
    public UpdateProductDiscountDefinitionValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();

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

public class UpdateProductDiscountDefinitionHandler
    : IRequestHandler<UpdateProductDiscountDefinitionRequest, UpdateProductDiscountDefinitionResult>
{
    private readonly ICommandRepository<ProductDiscountDefinition> _repository;
    private readonly ICommandRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _security;

    public UpdateProductDiscountDefinitionHandler(
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

    public async Task<UpdateProductDiscountDefinitionResult> Handle(
        UpdateProductDiscountDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new KeyNotFoundException("ProductDiscountDefinition not found.");

        // ✅ Read ProductName safely from DB
        var product = await _productRepository
            .GetQuery()
            .AsNoTracking()
            .Where(x => x.Id == request.ProductId)
            .Select(x => new { x.Id, x.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            throw new ValidationException("Invalid Product selected.");

        entity.ProductId = product.Id;
        entity.ProductName = product.Name;

        entity.DiscountName = request.DiscountName;
        entity.DiscountType = request.DiscountType;
        entity.DiscountPercentage = request.DiscountPercentage;
        entity.MaxDiscountAmount =
            request.DiscountType == "Upto" ? request.MaxDiscountAmount : null;

        entity.EffectiveFrom = _security.ConvertToIst(request.EffectiveFrom);
        entity.EffectiveTo = _security.ConvertToIst(request.EffectiveTo);

        entity.IsActive = request.IsActive;
        entity.UpdatedById = request.UpdatedById;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductDiscountDefinitionResult
        {
            Data = entity
        };
    }
}

#endregion
