using Application.Common.Repositories;
using Domain.Entities;
using MediatR;

namespace Application.Features.ProductManager.Commands;

#region ===== RESULT =====

public class DeleteProductDiscountDefinitionResult
{
    public bool IsDeleted { get; set; }
}

#endregion

#region ===== REQUEST =====

public class DeleteProductDiscountDefinitionRequest
    : IRequest<DeleteProductDiscountDefinitionResult>
{
    public string Id { get; init; } = default!;
}

#endregion

#region ===== HANDLER =====

public class DeleteProductDiscountDefinitionHandler
    : IRequestHandler<DeleteProductDiscountDefinitionRequest, DeleteProductDiscountDefinitionResult>
{
    private readonly ICommandRepository<ProductDiscountDefinition> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductDiscountDefinitionHandler(
        ICommandRepository<ProductDiscountDefinition> repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteProductDiscountDefinitionResult> Handle(
        DeleteProductDiscountDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new KeyNotFoundException("ProductDiscountDefinition not found.");

        _repository.Delete(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteProductDiscountDefinitionResult
        {
            IsDeleted = true
        };
    }
}

#endregion
