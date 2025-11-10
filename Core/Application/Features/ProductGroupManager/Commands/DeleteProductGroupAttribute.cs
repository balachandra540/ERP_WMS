using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductGroupAttributeManager.Commands;

// ===============================
// 🔹 Result
// ===============================
public class DeleteProductGroupAttributeResult
{
    public ProductGroupAttributes? Data { get; set; }
}

// ===============================
// 🔹 Request
// ===============================
public class DeleteProductGroupAttributeRequest : IRequest<DeleteProductGroupAttributeResult>
{
    /// <summary>
    /// Attribute Id to delete
    /// </summary>
    public string? Id { get; init; }

    /// <summary>
    /// User who performed delete
    /// </summary>
    public string? DeletedById { get; init; }

    /// <summary>
    /// Optional: If true, also delete all related attribute values
    /// </summary>
    public bool DeleteValues { get; init; } = false;
}

// ===============================
// 🔹 Validator
// ===============================
public class DeleteProductGroupAttributeValidator : AbstractValidator<DeleteProductGroupAttributeRequest>
{
    public DeleteProductGroupAttributeValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Attribute Id is required.");
    }
}

// ===============================
// 🔹 Handler
// ===============================
public class DeleteProductGroupAttributeHandler
    : IRequestHandler<DeleteProductGroupAttributeRequest, DeleteProductGroupAttributeResult>
{
    private readonly ICommandRepository<ProductGroupAttributes> _attributeRepository;
    private readonly ICommandRepository<ProductGroupAttributeValue> _valueRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductGroupAttributeHandler(
        ICommandRepository<ProductGroupAttributes> attributeRepository,
        ICommandRepository<ProductGroupAttributeValue> valueRepository,
        IUnitOfWork unitOfWork)
    {
        _attributeRepository = attributeRepository;
        _valueRepository = valueRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteProductGroupAttributeResult> Handle(
        DeleteProductGroupAttributeRequest request,
        CancellationToken cancellationToken)
    {
        // ✅ Fetch the attribute
        var entity = await _attributeRepository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Attribute not found: {request.Id}");
        }

        entity.UpdatedById = request.DeletedById;

        // ✅ If deleteValues flag is true, remove associated values too
        if (request.DeleteValues)
        {
            var values = await _valueRepository
                .GetQuery()
                .Where(v => v.AttributeId == request.Id)
                .ToListAsync(cancellationToken);

            foreach (var val in values)
            {
                _valueRepository.Delete(val);
            }
        }

        // ✅ Delete the attribute itself
        _attributeRepository.Delete(entity);

        // ✅ Commit transaction
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteProductGroupAttributeResult
        {
            Data = entity
        };
    }
}
