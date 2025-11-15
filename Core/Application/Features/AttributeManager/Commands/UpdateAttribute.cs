using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Attribute = Domain.Entities.Attribute;

namespace Application.Features.AttributeManager.Commands;

#region DTOs

public class UpdateAttributeDetailDto
{
    public string? Id { get; init; }
    public string? Value { get; init; }
}

public class UpdateAttributeResult
{
    public Attribute? Data { get; set; }
}

public class UpdateAttributeRequest : IRequest<UpdateAttributeResult>
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? UpdatedById { get; init; }
    public List<UpdateAttributeDetailDto> Details { get; init; } = new();
}

#endregion

#region Validator

public class UpdateAttributeValidator : AbstractValidator<UpdateAttributeRequest>
{
    public UpdateAttributeValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Attribute ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Attribute Name is required.");

        RuleForEach(x => x.Details).ChildRules(child =>
        {
            child.RuleFor(d => d.Value)
                .NotEmpty()
                .WithMessage("Detail value is required.");
        });
    }
}

#endregion

#region Handler

public class UpdateAttributeHandler : IRequestHandler<UpdateAttributeRequest, UpdateAttributeResult>
{
    private readonly ICommandRepository<Attribute> _attributeRepository;
    private readonly ICommandRepository<AttributeDetail> _detailRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;

    public UpdateAttributeHandler(
        ICommandRepository<Attribute> attributeRepository,
        ICommandRepository<AttributeDetail> detailRepository,
        IUnitOfWork unitOfWork,
        ISecurityService securityService)
    {
        _attributeRepository = attributeRepository;
        _detailRepository = detailRepository;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
    }

    public async Task<UpdateAttributeResult> Handle(UpdateAttributeRequest request, CancellationToken cancellationToken)
    {
        // STEP 1: Load existing entity with details
        var entity = await _attributeRepository
            .GetQuery()
            .Include(x => x.AttributeDetails)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Attribute not found: {request.Id}");

        // STEP 2: Update main Attribute fields
        entity.Name = request.Name.Trim();
        entity.Description = request.Description?.Trim();
        entity.UpdatedById = request.UpdatedById;

        _attributeRepository.Update(entity);

        // STEP 3: Detail update logic
        var existingDetails = entity.AttributeDetails.ToDictionary(x => x.Id, x => x);
        var incomingDetailIds = request.Details.Where(x => !string.IsNullOrWhiteSpace(x.Id))
                                               .Select(x => x.Id!)
                                               .ToHashSet();

        // ➤ Remove deleted details
        foreach (var old in entity.AttributeDetails.Where(d => !incomingDetailIds.Contains(d.Id)).ToList())
        {
            entity.AttributeDetails.Remove(old);
            _detailRepository.Delete(old);
        }

        // ➤ Update or add details
        foreach (var dto in request.Details)
        {
            if (!string.IsNullOrWhiteSpace(dto.Id) &&
                existingDetails.TryGetValue(dto.Id!, out var existing))
            {
                // Update existing detail
                existing.Value = dto.Value?.Trim();
                existing.UpdatedById = request.UpdatedById;
                _detailRepository.Update(existing);
            }
            else
            {
                // Add new detail
                if (string.IsNullOrWhiteSpace(dto.Value))
                    continue;

                var newDetail = new AttributeDetail
                {
                    AttributeId = entity.Id,
                    Value = dto.Value!.Trim(),
                    CreatedById = request.UpdatedById
                };

                await _detailRepository.CreateAsync(newDetail, cancellationToken);
                entity.AttributeDetails.Add(newDetail);
            }
        }

        // STEP 4: Commit changes
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateAttributeResult
        {
            Data = entity
        };
    }
}

#endregion
