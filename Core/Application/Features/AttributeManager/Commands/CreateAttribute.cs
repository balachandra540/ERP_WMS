using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Attribute = Domain.Entities.Attribute;

namespace Application.Features.AttributeManager.Commands;

public class CreateAttributeResult
{
    public Attribute? Data { get; set; }
}

public class CreateAttributeRequest : IRequest<CreateAttributeResult>
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? CreatedById { get; init; }

    // Child details (attribute values)
    public List<CreateAttributeDetailDto>? Details { get; init; } = new();
}

public class CreateAttributeDetailDto
{
    public string? Value { get; init; }
}

public class CreateAttributeValidator : AbstractValidator<CreateAttributeRequest>
{
    public CreateAttributeValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Attribute name is required.");
    }
}

public class CreateAttributeHandler : IRequestHandler<CreateAttributeRequest, CreateAttributeResult>
{
    private readonly ICommandRepository<Attribute> _repository;
    private readonly ICommandRepository<AttributeDetail> _detailRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly ISecurityService _securityService;

    public CreateAttributeHandler(
        ICommandRepository<Attribute> repository,
        ICommandRepository<AttributeDetail> detailRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        ISecurityService securityService)
    {
        _repository = repository;
        _detailRepository = detailRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _securityService = securityService;
    }

    public async Task<CreateAttributeResult> Handle(CreateAttributeRequest request, CancellationToken cancellationToken)
    {
        // Create main Attribute
        var entity = new Attribute
        {
            Number = _numberSequenceService.GenerateNumber(nameof(Attribute), "", "ATTR"),
            Name = request.Name!.Trim(),
            Description = request.Description?.Trim(),
            CreatedById = request.CreatedById,
        };

        await _repository.CreateAsync(entity, cancellationToken);

        // Create Attribute Details
        if (request.Details != null)
        {
            foreach (var d in request.Details)
            {
                if (string.IsNullOrWhiteSpace(d.Value))
                    continue;

                var detail = new AttributeDetail
                {
                    AttributeId = entity.Id,
                    Value = d.Value.Trim(),
                    CreatedById = request.CreatedById
                };

                await _detailRepository.CreateAsync(detail, cancellationToken);
            }
        }

        // Save all changes
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateAttributeResult
        {
            Data = entity
        };
    }
}
