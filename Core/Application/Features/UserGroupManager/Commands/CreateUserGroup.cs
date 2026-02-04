using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.UserGroupManager.Commands;

#region ===== RESULT =====

public class CreateUserGroupResult
{
    public UserGroup? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class CreateUserGroupRequest : IRequest<CreateUserGroupResult>
{
    public string? Name { get; init; }
    public string? Description { get; init; }

    public bool IsActive { get; init; }
   
    public string? CreatedById { get; init; }
}

#endregion

#region ===== VALIDATOR =====

public class CreateUserGroupValidator : AbstractValidator<CreateUserGroupRequest>
{
    public CreateUserGroupValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty();

    }
}

#endregion

#region ===== HANDLER =====

public class CreateUserGroupHandler
    : IRequestHandler<CreateUserGroupRequest, CreateUserGroupResult>
{
    private readonly ICommandRepository<UserGroup> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserGroupHandler(
        ICommandRepository<UserGroup> repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateUserGroupResult> Handle(
        CreateUserGroupRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = new UserGroup
        {
            Name = request.Name,
            Description = request.Description,

            IsActive = request.IsActive,

            
            CreatedById = request.CreatedById
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateUserGroupResult
        {
            Data = entity
        };
    }
}

#endregion
