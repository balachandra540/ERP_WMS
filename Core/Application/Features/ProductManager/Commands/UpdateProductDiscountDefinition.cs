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
    public List<ProductDiscountDetail> Details { get; set; } = new();
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

    // FIX: Changed to decimal? to prevent "null request" errors during JSON deserialization 
    // when the frontend sends null for Upto types.
    public decimal? DiscountPercentage { get; init; }

    // Child details used for 'Upto' type
    public List<DiscountDetailDto> Details { get; init; } = new();

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
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.DiscountName).NotEmpty();

        RuleFor(x => x.DiscountType)
            .NotEmpty()
            .Must(x => x == "Flat" || x == "Upto")
            .WithMessage("DiscountType must be Flat or Upto.");

        // Validate percentage for Flat type
        RuleFor(x => x.DiscountPercentage)
            .NotNull().WithMessage("Discount percentage is required for Flat type.")
            .GreaterThan(0).LessThanOrEqualTo(100)
            .When(x => x.DiscountType == "Flat")
            .WithMessage("Valid discount percentage (1-100) is required for Flat type.");

        // Validate child details for Upto type
        RuleFor(x => x.Details)
            .NotEmpty()
            .When(x => x.DiscountType == "Upto")
            .WithMessage("At least one user group rule is required for Upto type.");

        RuleForEach(x => x.Details).ChildRules(detail =>
        {
            detail.RuleFor(d => d.UserGroupId).NotEmpty().WithMessage("User Group is required.");
            detail.RuleFor(d => d.MaxPercentage).GreaterThan(0).LessThanOrEqualTo(100);
        }).When(x => x.DiscountType == "Upto");

        RuleFor(x => x.EffectiveFrom).NotEmpty().WithMessage("Effective From date is required.");
    }
}

#endregion

#region ===== HANDLER =====

public class UpdateProductDiscountDefinitionHandler
    : IRequestHandler<UpdateProductDiscountDefinitionRequest, UpdateProductDiscountDefinitionResult>
{
    private readonly ICommandRepository<ProductDiscountDefinition> _repository;
    private readonly ICommandRepository<ProductDiscountDetail> _detailRepository;
    private readonly ICommandRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _security;

    public UpdateProductDiscountDefinitionHandler(
        ICommandRepository<ProductDiscountDefinition> repository,
        ICommandRepository<ProductDiscountDetail> detailRepository,
        ICommandRepository<Product> productRepository,
        IUnitOfWork unitOfWork,
        ISecurityService security)
    {
        _repository = repository;
        _detailRepository = detailRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _security = security;
    }

    public async Task<UpdateProductDiscountDefinitionResult> Handle(
        UpdateProductDiscountDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch Header
        var entity = await _repository.GetAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException("Product Discount Definition not found.");

        // 2. Validate Product
        var product = await _productRepository.GetQuery()
            .AsNoTracking()
            .Where(x => x.Id == request.ProductId)
            .Select(x => new { x.Id, x.Name })
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            throw new ValidationException("Invalid Product selected.");

        // 3. Prepare Dates (IST)
        var newEffectiveFrom = _security.ConvertToIst(request.EffectiveFrom);
        var newEffectiveTo = _security.ConvertToIst(request.EffectiveTo);

        // ============================================================
        // STEP 4: DEACTIVATE CONFLICTING ACTIVE DISCOUNTS
        // ============================================================
        // Ensure only one record is active for this Product and Type within the date range
        if (request.IsActive)
        {
            var conflictingDiscounts = await _repository.GetQuery()
                .Where(x => x.Id != request.Id && // Exclude the record we are currently updating
                            x.ProductId == product.Id &&
                            x.DiscountType == request.DiscountType &&
                            x.IsActive == true &&
                            // Overlap check: (StartA <= EndB) and (EndA >= StartB)
                            (x.EffectiveFrom <= newEffectiveTo || newEffectiveTo == null) &&
                            (x.EffectiveTo >= newEffectiveFrom || x.EffectiveTo == null))
                .ToListAsync(cancellationToken);

            foreach (var conflict in conflictingDiscounts)
            {
                conflict.IsActive = false;
                conflict.UpdatedById = request.UpdatedById;
                conflict.UpdatedAtUtc = DateTime.UtcNow;
                _repository.Update(conflict);
            }
        }

        // 5. Update Header Fields
        entity.ProductId = product.Id;
        entity.ProductName = product.Name;
        entity.DiscountName = request.DiscountName;
        entity.DiscountType = request.DiscountType;

        // Logic: Percentage only applies to Flat (store 0 for Upto to satisfy DB constraints)
        entity.DiscountPercentage = request.DiscountType == "Flat" ? (request.DiscountPercentage ?? 0) : 0;

        entity.EffectiveFrom = newEffectiveFrom;
        entity.EffectiveTo = newEffectiveTo;

        entity.IsActive = request.IsActive;
        entity.UpdatedById = request.UpdatedById;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        // 6. Update Child Details (Clear and Re-add)
        var existingDetails = await _detailRepository.GetQuery()
            .Where(x => x.ProductDiscountDefinitionId == entity.Id)
            .ToListAsync(cancellationToken);

        foreach (var detail in existingDetails)
        {
            _detailRepository.Delete(detail);
        }

        var savedDetails = new List<ProductDiscountDetail>();

        if (request.DiscountType == "Upto")
        {
            foreach (var d in request.Details)
            {
                var newDetail = new ProductDiscountDetail
                {
                    ProductDiscountDefinitionId = entity.Id,
                    UserGroupId = d.UserGroupId,
                    MaxPercentage = d.MaxPercentage,
                    CreatedById = request.UpdatedById,
                    CreatedAtUtc = DateTime.UtcNow
                };

                await _detailRepository.CreateAsync(newDetail, cancellationToken);
                savedDetails.Add(newDetail);
            }
        }

        // 7. Final Transaction Save (Deactivations + Header + Details)
        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductDiscountDefinitionResult
        {
            Data = entity,
            Details = savedDetails
        };
    }
}

#endregion