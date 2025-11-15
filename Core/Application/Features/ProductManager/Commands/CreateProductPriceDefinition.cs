using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductManager.Commands;

public class CreateProductPriceDefinitionResult
{
    public ProductPriceDefinition? Data { get; set; }
}

public class CreateProductPriceDefinitionRequest : IRequest<CreateProductPriceDefinitionResult>
{
    public string ProductId { get; init; } = default!;
    public string? ProductName { get; init; }  

    public decimal CostPrice { get; init; }
    public decimal MarginPercentage { get; init; }
    public string CurrencyCode { get; init; } = default!;
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public bool IsActive { get; init; }
    public string? CreatedById { get; init; }
}

public class CreateProductPriceDefinitionValidator : AbstractValidator<CreateProductPriceDefinitionRequest>
{
    public CreateProductPriceDefinitionValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.ProductName).NotEmpty();
        RuleFor(x => x.CostPrice).NotNull();
        RuleFor(x => x.MarginPercentage).NotNull();
        RuleFor(x => x.CurrencyCode).NotEmpty();
        RuleFor(x => x.EffectiveFrom).NotEmpty();
    }
}

public class CreateProductPriceDefinitionHandler :
    IRequestHandler<CreateProductPriceDefinitionRequest, CreateProductPriceDefinitionResult>
{
    private readonly ICommandRepository<ProductPriceDefinition> _repository;
    private readonly IQueryContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _security;

    public CreateProductPriceDefinitionHandler(
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

    public async Task<CreateProductPriceDefinitionResult> Handle(
        CreateProductPriceDefinitionRequest request,
        CancellationToken cancellationToken)
    {
        var entity = new ProductPriceDefinition
        {
            ProductId = request.ProductId,
            ProductName = request.ProductName,
            CostPrice = request.CostPrice,
            MarginPercentage = request.MarginPercentage,
            CurrencyCode = request.CurrencyCode,
            EffectiveFrom = _security.ConvertToIst(request.EffectiveFrom),
            EffectiveTo = _security.ConvertToIst(request.EffectiveTo),
            IsActive = request.IsActive,
            CreatedById = request.CreatedById
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateProductPriceDefinitionResult { Data = entity };
    }
}
