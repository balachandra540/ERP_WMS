using Application.Common.Services.SecurityManager;
using FluentValidation;
using MediatR;

namespace Application.Features.SecurityManager.Commands
{
    // ================================
    // RESULT
    // ================================
    public class UpdateUserGroupRoleResult
    {
        public List<string>? Data { get; init; }
    }

    // ================================
    // REQUEST
    // ================================
    public class UpdateUserGroupRoleRequest
        : IRequest<UpdateUserGroupRoleResult>
    {
        public string? UserGroupId { get; init; }
        public string? RoleName { get; init; }
        public bool AccessGranted { get; init; }
    }

    // ================================
    // VALIDATOR
    // ================================
    public class UpdateUserGroupRoleValidator
        : AbstractValidator<UpdateUserGroupRoleRequest>
    {
        public UpdateUserGroupRoleValidator()
        {
            RuleFor(x => x.UserGroupId)
                .NotEmpty()
                .WithMessage("UserGroupId is required.");

            RuleFor(x => x.RoleName)
                .NotEmpty()
                .WithMessage("RoleName is required.");
        }
    }

    // ================================
    // HANDLER
    // ================================
    public class UpdateUserGroupRoleHandler
        : IRequestHandler<UpdateUserGroupRoleRequest, UpdateUserGroupRoleResult>
    {
        private readonly ISecurityService _securityService;

        public UpdateUserGroupRoleHandler(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        public async Task<UpdateUserGroupRoleResult> Handle(
            UpdateUserGroupRoleRequest request,
            CancellationToken cancellationToken)
        {
            var updatedRoles = await _securityService.UpdateUserGroupRoleAsync(
                request.UserGroupId!,
                request.RoleName!,
                request.AccessGranted,
                cancellationToken);

            return new UpdateUserGroupRoleResult
            {
                Data = updatedRoles
            };
        }
    }
}
