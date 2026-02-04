using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.UserGroupManager.Commands;

#region ===== RESULT =====

public class UpdateUserGroupResult
{
    public UserGroup? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class UpdateUserGroupRequest : IRequest<UpdateUserGroupResult>
{
    public string Id { get; init; } = default!;

    public string? Name { get; init; }
    public string? Description { get; init; }

    public bool IsActive { get; init; }
    

    public string? UpdatedById { get; init; }
}

#endregion

#region ===== VALIDATOR =====

public class UpdateUserGroupValidator : AbstractValidator<UpdateUserGroupRequest>
{
    public UpdateUserGroupValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty();

    }
}

#endregion

#region ===== HANDLER =====

public class UpdateUserGroupHandler
    : IRequestHandler<UpdateUserGroupRequest, UpdateUserGroupResult>
{
    private readonly ICommandRepository<UserGroup> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserGroupHandler(
        ICommandRepository<UserGroup> repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateUserGroupResult> Handle(
        UpdateUserGroupRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository
            .GetAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new Exception($"UserGroup not found: {request.Id}");

        entity.Name = request.Name;
        entity.Description = request.Description;

        entity.IsActive = request.IsActive;
       
        entity.UpdatedById = request.UpdatedById;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateUserGroupResult
        {
            Data = entity
        };
    }
}

#endregion
