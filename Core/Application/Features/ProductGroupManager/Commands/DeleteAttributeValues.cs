using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductGroupAttributeValues.Commands;

// ===============================
// 🔹 Result
// ===============================
public class DeleteProductGroupAttributeValueResult
{
    public List<ProductGroupAttributeValue>? Data { get; set; }
}

// ===============================
// 🔹 Request
// ===============================
public class DeleteProductGroupAttributeValueRequest : IRequest<DeleteProductGroupAttributeValueResult>
{
    /// <summary>
    /// Can be either the specific Value Id or the AttributeId (if deleteAll = true)
    /// </summary>
    public string? IdOrAttributeId { get; init; }

    public string? DeletedById { get; init; }

    /// <summary>
    /// If true, delete all values under the AttributeId
    /// </summary>
    public bool DeleteAll { get; init; } = false;
}

// ===============================
// 🔹 Validator
// ===============================
public class DeleteProductGroupAttributeValueValidator : AbstractValidator<DeleteProductGroupAttributeValueRequest>
{
    public DeleteProductGroupAttributeValueValidator()
    {
        RuleFor(x => x.IdOrAttributeId)
            .NotEmpty().WithMessage("IdOrAttributeId is required.");
    }
}

// ===============================
// 🔹 Handler
// ===============================
public class DeleteProductGroupAttributeValueHandler
    : IRequestHandler<DeleteProductGroupAttributeValueRequest, DeleteProductGroupAttributeValueResult>
{
    private readonly ICommandRepository<ProductGroupAttributeValue> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductGroupAttributeValueHandler(
        ICommandRepository<ProductGroupAttributeValue> repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteProductGroupAttributeValueResult> Handle(
        DeleteProductGroupAttributeValueRequest request,
        CancellationToken cancellationToken)
    {
        List<ProductGroupAttributeValue> deletedEntities = new();

        if (request.DeleteAll)
        {
            // ✅ Delete all values for the given AttributeId
            var entities = await _repository
                .GetQuery()
                .Where(x => x.AttributeId == request.IdOrAttributeId)
                .ToListAsync(cancellationToken);

            if (!entities.Any())
                throw new Exception($"No attribute values found for AttributeId: {request.IdOrAttributeId}");

            foreach (var entity in entities)
            {
                entity.UpdatedById = request.DeletedById;
                _repository.Delete(entity);
                deletedEntities.Add(entity);
            }
        }
        else
        {
            // ✅ Delete specific attribute value
            var entity = await _repository.GetAsync(request.IdOrAttributeId ?? string.Empty, cancellationToken);

            if (entity == null)
                throw new Exception($"Attribute value not found: {request.IdOrAttributeId}");

            entity.UpdatedById = request.DeletedById;
            _repository.Delete(entity);
            deletedEntities.Add(entity);
        }

        // ✅ Save changes
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteProductGroupAttributeValueResult
        {
            Data = deletedEntities
        };
    }
}
