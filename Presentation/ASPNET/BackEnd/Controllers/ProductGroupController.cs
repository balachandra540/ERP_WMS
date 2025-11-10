using Application.Features.ProductGroupAttributeManager.Commands;
using Application.Features.ProductGroupAttributeManager.Queries;
using Application.Features.ProductGroupAttributeValues.Commands;
using Application.Features.ProductGroupAttributeValues.Queries;
using Application.Features.ProductGroupManager.Commands;
using Application.Features.ProductGroupManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers;

[Route("api/[controller]")]
public class ProductGroupController : BaseApiController
{
    public ProductGroupController(ISender sender) : base(sender)
    {
    }

    [Authorize]
    [HttpPost("CreateProductGroup")]
    public async Task<ActionResult<ApiSuccessResult<CreateProductGroupResult>>> CreateProductGroupAsync(CreateProductGroupRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateProductGroupResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateProductGroupAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("UpdateProductGroup")]
    public async Task<ActionResult<ApiSuccessResult<UpdateProductGroupResult>>> UpdateProductGroupAsync(UpdateProductGroupRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateProductGroupResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateProductGroupAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("DeleteProductGroup")]
    public async Task<ActionResult<ApiSuccessResult<DeleteProductGroupResult>>> DeleteProductGroupAsync(DeleteProductGroupRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteProductGroupResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteProductGroupAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetProductGroupList")]
    public async Task<ActionResult<ApiSuccessResult<GetProductGroupListResult>>> GetProductGroupListAsync(
        CancellationToken cancellationToken,
        [FromQuery] bool isDeleted = false
        )
    {
        var request = new GetProductGroupListRequest { IsDeleted = isDeleted };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductGroupListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetProductGroupListAsync)}",
            Content = response
        });
    }
    // ✅ GET: Get Attributes by ProductGroupId
    [Authorize]
    [HttpGet("GetAttributes")]
    public async Task<ActionResult<ApiSuccessResult<GetProductGroupAttributeListResult>>> GetAttributes(
            [FromQuery] string? productGroupId,
            [FromQuery] bool isDeleted = false,
            CancellationToken cancellationToken = default)
    {
        var request = new GetProductGroupAttributeListRequest
        {
            ProductGroupId = productGroupId,
            IsDeleted = isDeleted
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductGroupAttributeListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetAttributes)}",
            Content = response
        });
    }

    [Authorize]
    // ✅ POST: Create multiple attributes
    [HttpPost("CreateAttributes")]
    public async Task<ActionResult<ApiSuccessResult<List<CreateProductGroupAttributeResult>>>> CreateAttributes(
    [FromBody] List<CreateProductGroupAttributeRequest> attributes,
    CancellationToken cancellationToken)
    {
        var results = new List<CreateProductGroupAttributeResult>();

        foreach (var attr in attributes)
        {
            var response = await _sender.Send(attr, cancellationToken);
            results.Add(response);
        }

        return Ok(new ApiSuccessResult<List<CreateProductGroupAttributeResult>>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateAttributes)}",
            Content = results
        });
    }

    [Authorize]
    // ✅ POST: Update multiple attributes
    [HttpPost("UpdateAttributes")]
    public async Task<ActionResult<ApiSuccessResult<List<UpdateProductGroupAttributeResult>>>> UpdateAttributes(
        [FromBody] List<UpdateProductGroupAttributeRequest> attributes,
        CancellationToken cancellationToken)
    {
        var results = new List<UpdateProductGroupAttributeResult>();

        foreach (var attr in attributes)
        {
            var response = await _sender.Send(attr, cancellationToken);
            results.Add(response);
        }

        return Ok(new ApiSuccessResult<List<UpdateProductGroupAttributeResult>>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateAttributes)}",
            Content = results
        });
    }

    [Authorize]
    // ✅ POST: Delete attributes (single or multiple)
    [HttpPost("DeleteAttributes")]
    public async Task<ActionResult<ApiSuccessResult<DeleteProductGroupAttributeResult>>> DeleteAttributes(
        [FromBody] DeleteProductGroupAttributeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteProductGroupAttributeResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteAttributes)}",
            Content = result
        });
    }









    // ✅ GET: Get Attribute Values by AttributeId OR ProductGroupId
    [Authorize]
    [HttpGet("GetAttributeValues")]
    public async Task<ActionResult<ApiSuccessResult<GetProductGroupAttributeValueListResult>>> GetAttributeValues(
        [FromQuery] string? attributeId,
        [FromQuery] string? productGroupId,
        [FromQuery] bool isDeleted = false,
        CancellationToken cancellationToken = default)
    {
        var request = new GetProductGroupAttributeValueListRequest
        {
            AttributeId = attributeId,
            ProductGroupId = productGroupId,
            IsDeleted = isDeleted
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductGroupAttributeValueListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetAttributeValues)}",
            Content = response
        });
    }

    // ✅ POST: Create multiple attribute values
    [Authorize]
    [HttpPost("CreateAttributeValues")]
    public async Task<ActionResult<ApiSuccessResult<List<CreateProductGroupAttributeValueResult>>>> CreateAttributeValues(
    [FromBody] List<CreateProductGroupAttributeValueRequest> values,
    CancellationToken cancellationToken)
    {
        var results = new List<CreateProductGroupAttributeValueResult>();

        foreach (var val in values)
        {
            var response = await _sender.Send(val, cancellationToken);
            results.Add(response);
        }

        return Ok(new ApiSuccessResult<List<CreateProductGroupAttributeValueResult>>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateAttributeValues)}",
            Content = results
        });
    }

    // ✅ POST: Update multiple attribute values
    [Authorize]
    [HttpPost("UpdateAttributeValues")]
    public async Task<ActionResult<ApiSuccessResult<List<UpdateProductGroupAttributeValueResult>>>> UpdateAttributeValues(
        [FromBody] List<UpdateProductGroupAttributeValueRequest> values,
        CancellationToken cancellationToken)
    {
        var results = new List<UpdateProductGroupAttributeValueResult>();

        foreach (var val in values)
        {
            var response = await _sender.Send(val, cancellationToken);
            results.Add(response);
        }

        return Ok(new ApiSuccessResult<List<UpdateProductGroupAttributeValueResult>>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateAttributeValues)}",
            Content = results
        });
    }


    // ✅ POST: Delete one or multiple attribute values
    [Authorize]
    [HttpPost("DeleteAttributeValues")]
    public async Task<ActionResult<ApiSuccessResult<DeleteProductGroupAttributeValueResult>>> DeleteAttributeValues(
        [FromBody] DeleteProductGroupAttributeValueRequest request,
        CancellationToken cancellationToken)
    {

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteProductGroupAttributeValueResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteAttributeValues)}",
            Content = response
        });
    }

}


