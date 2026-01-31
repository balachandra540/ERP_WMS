using Application.Features.UserGroupManager.Commands;
using Application.Features.UserGroupManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers;

[Route("api/[controller]")]
public class UserGroupController : BaseApiController
{
    public UserGroupController(ISender sender) : base(sender)
    {
    }

    // =============================
    // CREATE
    // =============================
    [Authorize]
    [HttpPost("CreateUserGroup")]
    public async Task<ActionResult<ApiSuccessResult<CreateUserGroupResult>>> CreateUserGroupAsync(
        CreateUserGroupRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateUserGroupResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateUserGroupAsync)}",
            Content = response
        });
    }

    // =============================
    // UPDATE
    // =============================
    [Authorize]
    [HttpPost("UpdateUserGroup")]
    public async Task<ActionResult<ApiSuccessResult<UpdateUserGroupResult>>> UpdateUserGroupAsync(
        UpdateUserGroupRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateUserGroupResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateUserGroupAsync)}",
            Content = response
        });
    }

    // =============================
    // DELETE
    // =============================
    [Authorize]
    [HttpPost("DeleteUserGroup")]
    public async Task<ActionResult<ApiSuccessResult<DeleteUserGroupResult>>> DeleteUserGroupAsync(
        DeleteUserGroupRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteUserGroupResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteUserGroupAsync)}",
            Content = response
        });
    }

    // =============================
    // LIST
    // =============================
    [Authorize]
    [HttpGet("GetUserGroupList")]
    public async Task<ActionResult<ApiSuccessResult<GetUserGroupListResult>>> GetUserGroupListAsync(
        CancellationToken cancellationToken,
        [FromQuery] bool isDeleted = false)
    {
        var request = new GetUserGroupListRequest
        {
            IsDeleted = isDeleted
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetUserGroupListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetUserGroupListAsync)}",
            Content = response
        });
    }
}
