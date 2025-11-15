using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Attribute = Domain.Entities.Attribute;

namespace Application.Features.AttributeManager.Commands;

public class DeleteAttributeResult
{
    public Attribute? Data { get; set; }
}

public class DeleteAttributeRequest : IRequest<DeleteAttributeResult>
{
    public string? Id { get; init; }
    public string? DeletedById { get; init; }
}

public class DeleteAttributeValidator : AbstractValidator<DeleteAttributeRequest>
{
    public DeleteAttributeValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
    }
}

public class DeleteAttributeHandler : IRequestHandler<DeleteAttributeRequest, DeleteAttributeResult>
{
    private readonly ICommandRepository<Attribute> _attributeRepository;
    private readonly ICommandRepository<AttributeDetail> _detailRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteAttributeHandler(
        ICommandRepository<Attribute> attributeRepository,
        ICommandRepository<AttributeDetail> detailRepository,
        IUnitOfWork unitOfWork)
    {
        _attributeRepository = attributeRepository;
        _detailRepository = detailRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteAttributeResult> Handle(DeleteAttributeRequest request, CancellationToken cancellationToken)
    {
        var entity = await _attributeRepository
            .GetQuery()
            .Include(x => x.AttributeDetails)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
            throw new Exception($"Entity not found: {request.Id}");

        entity.UpdatedById = request.DeletedById;

        foreach (var detail in entity.AttributeDetails.ToList())
            _detailRepository.Delete(detail);

        _attributeRepository.Delete(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteAttributeResult { Data = entity };
    }
}
