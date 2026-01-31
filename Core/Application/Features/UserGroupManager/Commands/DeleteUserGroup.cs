using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.UserGroupManager.Commands;

#region ===== RESULT =====

public class DeleteUserGroupResult
{
    public UserGroup? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class DeleteUserGroupRequest : IRequest<DeleteUserGroupResult>
{
    public string? Id { get; init; }
    public string? DeletedById { get; init; }
}

#endregion

#region ===== VALIDATOR =====

public class DeleteUserGroupValidator : AbstractValidator<DeleteUserGroupRequest>
{
    public DeleteUserGroupValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty();
    }
}

#endregion

#region ===== HANDLER =====

public class DeleteUserGroupHandler
    : IRequestHandler<DeleteUserGroupRequest, DeleteUserGroupResult>
{
    private readonly ICommandRepository<UserGroup> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteUserGroupHandler(
        ICommandRepository<UserGroup> repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteUserGroupResult> Handle(
        DeleteUserGroupRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _repository
            .GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
            throw new Exception($"Entity not found: {request.Id}");

        entity.UpdatedById = request.DeletedById;

        _repository.Delete(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteUserGroupResult
        {
            Data = entity
        };
    }
}

#endregion
