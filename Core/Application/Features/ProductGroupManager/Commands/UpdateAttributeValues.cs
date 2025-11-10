using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductGroupAttributeValues.Commands;

// ===============================
// 🔹 Result
// ===============================
public class UpdateProductGroupAttributeValueResult
{
    public ProductGroupAttributeValue? Data { get; set; }
}

// ===============================
// 🔹 Request
// ===============================
public class UpdateProductGroupAttributeValueRequest : IRequest<UpdateProductGroupAttributeValueResult>
{
    public string Id { get; init; }                   // Value ID
    public string AttributeId { get; init; }          // Parent attribute ID
    public string ValueName { get; init; }            // Updated value name
    public string? UpdatedById { get; init; }         // User performing update
}

// ===============================
// 🔹 Validator
// ===============================
public class UpdateProductGroupAttributeValueValidator : AbstractValidator<UpdateProductGroupAttributeValueRequest>
{
    public UpdateProductGroupAttributeValueValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.AttributeId)
            .NotEmpty().WithMessage("AttributeId is required.");

        RuleFor(x => x.ValueName)
            .NotEmpty().WithMessage("ValueName is required.")
            .MaximumLength(200).WithMessage("ValueName cannot exceed 200 characters.");
    }
}

// ===============================
// 🔹 Handler
// ===============================
public class UpdateProductGroupAttributeValueHandler
    : IRequestHandler<UpdateProductGroupAttributeValueRequest, UpdateProductGroupAttributeValueResult>
{
    private readonly ICommandRepository<ProductGroupAttributeValue> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;

    public UpdateProductGroupAttributeValueHandler(
        ICommandRepository<ProductGroupAttributeValue> repository,
        IUnitOfWork unitOfWork,
        ISecurityService securityService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
    }

    public async Task<UpdateProductGroupAttributeValueResult> Handle(
        UpdateProductGroupAttributeValueRequest request,
        CancellationToken cancellationToken)
    {
        // ✅ Fetch entity
        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Attribute value not found: {request.Id}");
        }

        // ✅ Apply updates
        entity.UpdatedById = request.UpdatedById;


        entity.AttributeId = request.AttributeId;
        entity.ValueName = request.ValueName;

        // ✅ Update and commit
         _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductGroupAttributeValueResult
        {
            Data = entity
        };
    }
}
