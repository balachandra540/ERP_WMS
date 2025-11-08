using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductGroupAttributeManager.Commands;

public class UpdateProductGroupAttributeResult
{
    public ProductGroupAttributes? Data { get; set; }
}

public class UpdateProductGroupAttributeRequest : IRequest<UpdateProductGroupAttributeResult>
{
    public string Id { get; init; }
    public string ProductGroupId { get; init; }
    public string AttributeName { get; init; }
    //public string? AttributeValue { get; init; }

    public string? UpdatedBy { get; init; }
}

public class UpdateProductGroupAttributeValidator : AbstractValidator<UpdateProductGroupAttributeRequest>
{
    public UpdateProductGroupAttributeValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ProductGroupId).NotEmpty();
        RuleFor(x => x.AttributeName).NotEmpty();
    }
}

public class UpdateProductGroupAttributeHandler : IRequestHandler<UpdateProductGroupAttributeRequest, UpdateProductGroupAttributeResult>
{
    private readonly ICommandRepository<ProductGroupAttributes> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;


    public UpdateProductGroupAttributeHandler(
        ICommandRepository<ProductGroupAttributes> repository,
        IUnitOfWork unitOfWork,
        ISecurityService securityService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _securityService = securityService;

    }

    public async Task<UpdateProductGroupAttributeResult> Handle(UpdateProductGroupAttributeRequest request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Attribute not found: {request.Id}");
        }
        entity.UpdatedById = request.UpdatedBy;

        entity.ProductGroupId = request.ProductGroupId;
        entity.AttributeName = request.AttributeName;
        //entity.AttributeValue = request.AttributeValue;
        //entity.UpdatedAtUtc = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        //UpdatedAtUtc = (_securityService.ConvertToIst(request.UpdatedAtUtc) ?? DateTime.UtcNow).ToUniversalTime(),

         _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateProductGroupAttributeResult
        {
            Data = entity
        };
    }
}
