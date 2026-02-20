using Application.Common.Services.SecurityManager;
using FluentValidation;
using MediatR;

namespace Application.Features.SecurityManager.Queries;




public class GetUserGroupRolesResult
{
    public List<string>? Data { get; init; }
}

public class GetUserGroupRolesRequest
    : IRequest<GetUserGroupRolesResult>
{
    public string? UserGroupId { get; init; }
}

public class GetUserGroupRolesValidator
    : AbstractValidator<GetUserGroupRolesRequest>
{
    public GetUserGroupRolesValidator()
    {
        RuleFor(x => x.UserGroupId)
            .NotEmpty()
            .WithMessage("UserGroupId is required.");
    }
}

public class GetUserGroupRolesHandler
    : IRequestHandler<GetUserGroupRolesRequest, GetUserGroupRolesResult>
{
    private readonly ISecurityService _securityService;

    public GetUserGroupRolesHandler(ISecurityService securityService)
    {
        _securityService = securityService;
    }

    public async Task<GetUserGroupRolesResult> Handle(
        GetUserGroupRolesRequest request,
        CancellationToken cancellationToken)
    {
        var roles = await _securityService.GetUserGroupRolesAsync(
            request.UserGroupId!,
            cancellationToken);

        return new GetUserGroupRolesResult
        {
            Data = roles
        };
    }
}
