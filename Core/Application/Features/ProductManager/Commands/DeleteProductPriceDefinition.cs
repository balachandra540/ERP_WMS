using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductManager.Commands;

public class DeleteProductPriceDefinitionResult
{
    public ProductPriceDefinition? Data { get; set; }

}

public class DeleteProductPriceDefinitionRequest : IRequest<DeleteProductPriceDefinitionResult>
{
    public string Id { get; init; } 
    public string? DeletedById { get; init; }

}

public class DeleteProductPriceDefinitionValidator : AbstractValidator<DeleteProductPriceDefinitionRequest>
{
    public DeleteProductPriceDefinitionValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}


public class DeleteProductPriceDefinitionHandler :
    IRequestHandler<DeleteProductPriceDefinitionRequest, DeleteProductPriceDefinitionResult>
{
    private readonly ICommandRepository<ProductPriceDefinition> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductPriceDefinitionHandler(
        ICommandRepository<ProductPriceDefinition> repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteProductPriceDefinitionResult> Handle(
        DeleteProductPriceDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);
        if (entity == null)
            throw new Exception($"Entity not found: {request.Id}");
        entity.UpdatedById = request.DeletedById;

        _repository.Delete(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteProductPriceDefinitionResult { Data = entity };

        
    }
}
