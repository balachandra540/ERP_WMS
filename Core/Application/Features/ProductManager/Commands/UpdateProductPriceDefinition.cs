using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductManager.Commands;

public class UpdateProductPriceDefinitionResult
{
    public ProductPriceDefinition? Data { get; set; }
}

public class UpdateProductPriceDefinitionRequest : IRequest<UpdateProductPriceDefinitionResult>
{
    public string Id { get; init; } = default!;
    public string ProductId { get; init; } = default!;
    public string? ProductName { get; init; } 

    public decimal CostPrice { get; init; }
    public decimal MarginPercentage { get; init; }
    public string CurrencyCode { get; init; } = default!;
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public bool IsActive { get; init; }
    public string? UpdatedById { get; init; }
}

public class UpdateProductPriceDefinitionValidator : AbstractValidator<UpdateProductPriceDefinitionRequest>
{
    public UpdateProductPriceDefinitionValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.ProductName).NotEmpty();
        RuleFor(x => x.CostPrice).NotNull();
        RuleFor(x => x.MarginPercentage).NotNull();
        RuleFor(x => x.CurrencyCode).NotEmpty();
        RuleFor(x => x.EffectiveFrom).NotEmpty();
    }
}

public class UpdateProductPriceDefinitionHandler :
    IRequestHandler<UpdateProductPriceDefinitionRequest, UpdateProductPriceDefinitionResult>
{
    private readonly ICommandRepository<ProductPriceDefinition> _repository;
    private readonly IQueryContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _security;

    public UpdateProductPriceDefinitionHandler(
        ICommandRepository<ProductPriceDefinition> repository,
        IQueryContext context,
        IUnitOfWork unitOfWork,
        ISecurityService security)
    {
        _repository = repository;
        _context = context;
        _unitOfWork = unitOfWork;
        _security = security;
    }

    public async Task<UpdateProductPriceDefinitionResult> Handle(
        UpdateProductPriceDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository.GetAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new Exception("Product Price Definition not found");

        entity.ProductId = request.ProductId;
        entity.ProductName = request.ProductName;
        entity.CostPrice = request.CostPrice;
        entity.MarginPercentage = request.MarginPercentage;
        entity.CurrencyCode = request.CurrencyCode;
        entity.EffectiveFrom = _security.ConvertToIst(request.EffectiveFrom);
        entity.EffectiveTo = _security.ConvertToIst(request.EffectiveTo);
        entity.IsActive = request.IsActive;
        entity.UpdatedById = request.UpdatedById;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductPriceDefinitionResult { Data = entity };
    }
}
