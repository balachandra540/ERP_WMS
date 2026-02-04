using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Commands;

#region ===== DTOs =====
public class DiscountDetailDto
{
    public string UserGroupId { get; init; } = default!;
    public decimal MaxPercentage { get; init; }
}
#endregion

#region ===== RESULT =====
public class CreateProductDiscountDefinitionResult
{
    public ProductDiscountDefinition? Data { get; set; }
    public List<ProductDiscountDetail> Details { get; set; } = new();
}
#endregion

#region ===== REQUEST =====
public class CreateProductDiscountDefinitionRequest
    : IRequest<CreateProductDiscountDefinitionResult>
{
    public string ProductId { get; init; } = default!;
    public string DiscountName { get; init; } = default!;
    public string DiscountType { get; init; } = default!; // Flat / Upto

    // FIX: Changed to decimal? to prevent "null request" error during JSON deserialization 
    // when the frontend sends null for Upto types.
    public decimal? DiscountPercentage { get; init; }

    public List<DiscountDetailDto> Details { get; init; } = new(); // Used for Upto
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
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("Product is required.");
        RuleFor(x => x.DiscountName).NotEmpty().WithMessage("Discount Name is required.");
        RuleFor(x => x.DiscountType).NotEmpty().Must(x => x == "Flat" || x == "Upto");

        // Validate percentage only for Flat type
        RuleFor(x => x.DiscountPercentage)
            .NotNull().WithMessage("Discount percentage is required for Flat type.")
            .GreaterThan(0).LessThanOrEqualTo(100)
            .When(x => x.DiscountType == "Flat")
            .WithMessage("Valid percentage (1-100) required for Flat type.");

        // Validate child details only for Upto type
        RuleFor(x => x.Details)
            .NotEmpty()
            .When(x => x.DiscountType == "Upto")
            .WithMessage("At least one user group limit is required for Upto type.");

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
public class CreateProductDiscountDefinitionHandler
    : IRequestHandler<CreateProductDiscountDefinitionRequest, CreateProductDiscountDefinitionResult>
{
    private readonly ICommandRepository<ProductDiscountDefinition> _repository;
    private readonly ICommandRepository<ProductDiscountDetail> _detailRepository;
    private readonly ICommandRepository<Product> _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _security;

    public CreateProductDiscountDefinitionHandler(
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

    public async Task<CreateProductDiscountDefinitionResult> Handle(
        CreateProductDiscountDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        // Step 1: Validate Product
        var product = await _productRepository.GetQuery()
            .AsNoTracking()
            .Where(x => x.Id == request.ProductId)
            .Select(x => new { x.Id, x.Name })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("Product not found.");

        // Step 2: Prepare Dates (IST)
        var newEffectiveFrom = _security.ConvertToIst(request.EffectiveFrom);
        var newEffectiveTo = _security.ConvertToIst(request.EffectiveTo);

        // ============================================================
        // STEP 3: DEACTIVATE CONFLICTING ACTIVE DISCOUNTS
        // ============================================================
        // Ensure only one record is active for this Product and DiscountType within the date range
        if (request.IsActive)
        {
            var conflictingDiscounts = await _repository.GetQuery()
                .Where(x => x.ProductId == product.Id &&
                            x.DiscountType == request.DiscountType &&
                            x.IsActive == true &&
                            // Overlap check logic
                            (x.EffectiveFrom <= newEffectiveTo || newEffectiveTo == null) &&
                            (x.EffectiveTo >= newEffectiveFrom || x.EffectiveTo == null))
                .ToListAsync(cancellationToken);

            foreach (var conflict in conflictingDiscounts)
            {
                conflict.IsActive = false;
                conflict.UpdatedById = request.CreatedById;
                conflict.UpdatedAtUtc = DateTime.UtcNow;
                _repository.Update(conflict);
            }
        }

        // Step 4: Create Main Header (Definition)
        var definition = new ProductDiscountDefinition
        {
            ProductId = product.Id,
            ProductName = product.Name,
            DiscountName = request.DiscountName,
            DiscountType = request.DiscountType,

            // Handle nullable percentage for Flat type, default to 0 for Upto
            DiscountPercentage = request.DiscountType == "Flat" ? (request.DiscountPercentage ?? 0) : 0,

            EffectiveFrom = newEffectiveFrom,
            EffectiveTo = newEffectiveTo,

            IsActive = request.IsActive,
            CreatedById = request.CreatedById,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _repository.CreateAsync(definition, cancellationToken);

        // Step 5: Save parent first to generate ID for child details
        await _unitOfWork.SaveAsync(cancellationToken);

        var savedDetails = new List<ProductDiscountDetail>();

        // Step 6: Process and Save Details if "Upto"
        if (request.DiscountType == "Upto")
        {
            foreach (var detailDto in request.Details)
            {
                var detail = new ProductDiscountDetail
                {
                    ProductDiscountDefinitionId = definition.Id, // Link to Parent
                    UserGroupId = detailDto.UserGroupId,
                    MaxPercentage = detailDto.MaxPercentage,
                    CreatedById = request.CreatedById,
                    CreatedAtUtc = DateTime.UtcNow
                };

                await _detailRepository.CreateAsync(detail, cancellationToken);
                savedDetails.Add(detail);
            }

            // Final Save for all added details
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        return new CreateProductDiscountDefinitionResult
        {
            Data = definition,
            Details = savedDetails
        };
    }
}
#endregion