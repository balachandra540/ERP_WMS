using Application.Features.AttributeManager.Commands;
using Application.Features.AttributeManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(GroupName = "Inventory")]
[Tags("Attributes")]
public class AttributeController : BaseApiController
{
    public AttributeController(ISender sender) : base(sender) { }

    // CREATE ATTRIBUTE
    [HttpPost("CreateAttribute")]
    public async Task<ActionResult<ApiSuccessResult<CreateAttributeResult>>> CreateAttributeAsync(
        [FromBody] CreateAttributeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);
        return Ok(new ApiSuccessResult<CreateAttributeResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateAttributeAsync)}",
            Content = response
        });
    }

    // UPDATE ATTRIBUTE
    [HttpPost("UpdateAttribute")]
    public async Task<ActionResult<ApiSuccessResult<UpdateAttributeResult>>> UpdateAttributeAsync(
        [FromBody] UpdateAttributeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);
        return Ok(new ApiSuccessResult<UpdateAttributeResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateAttributeAsync)}",
            Content = response
        });
    }

    // DELETE ATTRIBUTE
    [HttpPost("DeleteAttribute")]
    public async Task<ActionResult<ApiSuccessResult<DeleteAttributeResult>>> DeleteAttributeAsync(
        [FromBody] DeleteAttributeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);
        return Ok(new ApiSuccessResult<DeleteAttributeResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteAttributeAsync)}",
            Content = response
        });
    }

    // GET ATTRIBUTE LIST
    [HttpGet("GetAttributeList")]
    public async Task<ActionResult<ApiSuccessResult<GetAttributeListResult>>> GetAttributeListAsync(
        CancellationToken cancellationToken,
        [FromQuery] bool isDeleted = false)
    {
        var request = new GetAttributeListRequest { IsDeleted = isDeleted };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetAttributeListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetAttributeListAsync)}",
            Content = response
        });
    }

    // GET SINGLE ATTRIBUTE
    //[HttpGet("GetAttributeSingle")]
    //public async Task<ActionResult<ApiSuccessResult<GetAttributeSingleResult>>> GetAttributeSingleAsync(
    //    [FromQuery] string id,
    //    CancellationToken cancellationToken)
    //{
    //    var request = new GetAttributeSingleRequest { Id = id };
    //    var response = await _sender.Send(request, cancellationToken);

    //    if (response == null)
    //    {
    //        return NotFound(new ApiErrorResult
    //        {
    //            Code = StatusCodes.Status404NotFound,
    //            Message = $"Attribute not found: {id}"
    //        });
    //    }

    //    return Ok(new ApiSuccessResult<GetAttributeSingleResult>
    //    {
    //        Code = StatusCodes.Status200OK,
    //        Message = $"Success executing {nameof(GetAttributeSingleAsync)}",
    //        Content = response
    //    });
    //}
}
