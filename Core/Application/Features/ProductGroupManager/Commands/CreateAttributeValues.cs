using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductGroupAttributeValues.Commands;

// ===============================
// 🔹 Result
// ===============================
public class CreateProductGroupAttributeValueResult
{
    public ProductGroupAttributeValue? Data { get; set; }
}

// ===============================
// 🔹 Request
// ===============================
public class CreateProductGroupAttributeValueRequest : IRequest<CreateProductGroupAttributeValueResult>
{
    public string AttributeId { get; init; }          // FK → ProductGroupAttributes.Id
    public string ValueName { get; init; }            // Actual value, e.g., "Red"
    public string? CreatedById { get; init; }         // User who created
}

// ===============================
// 🔹 Validation
// ===============================
public class CreateProductGroupAttributeValueValidator : AbstractValidator<CreateProductGroupAttributeValueRequest>
{
    public CreateProductGroupAttributeValueValidator()
    {
        RuleFor(x => x.AttributeId)
            .NotEmpty().WithMessage("AttributeId is required.");

        //RuleFor(x => x.ValueName)
        //    .NotEmpty().WithMessage("ValueName cannot be empty.")
        //    .MaximumLength(1200).WithMessage("ValueName cannot exceed 200 characters.");
    }
}

// ===============================
// 🔹 Handler
// ===============================
public class CreateProductGroupAttributeValueHandler
    : IRequestHandler<CreateProductGroupAttributeValueRequest, CreateProductGroupAttributeValueResult>
{
    private readonly ICommandRepository<ProductGroupAttributeValue> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;

    public CreateProductGroupAttributeValueHandler(
        ICommandRepository<ProductGroupAttributeValue> repository,
        IUnitOfWork unitOfWork,
        ISecurityService securityService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
    }

    public async Task<CreateProductGroupAttributeValueResult> Handle(
        CreateProductGroupAttributeValueRequest request,
        CancellationToken cancellationToken)
    {
        // ✅ Create entity
        var entity = new ProductGroupAttributeValue
        {
            AttributeId = request.AttributeId,
            ValueName = request.ValueName,
            CreatedById = request.CreatedById,
            //CreatedAtUtc = DateTimeOffset.UtcNow,
            //UpdatedAtUtc = DateTimeOffset.UtcNow
        };

        // ✅ Save to repository
        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // ✅ Return created entity
        return new CreateProductGroupAttributeValueResult
        {
            Data = entity
        };
    }
}
