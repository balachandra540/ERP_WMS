using Application.Features.GoodsReceiveManager.Commands;
using Application.Features.GoodsReceiveManager.Queries;
using Application.Features.NegativeAdjustmentManager.Commands;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading;

namespace ASPNET.BackEnd.Controllers;

[Route("api/[controller]")]
public class GoodsReceiveController : BaseApiController
{
    public GoodsReceiveController(ISender sender) : base(sender)
    {
    }

    [Authorize]
    [HttpPost("CreateGoodsReceive")]
    public async Task<ActionResult<ApiSuccessResult<CreateGoodsReceiveResult>>> CreateGoodsReceiveAsync(CreateGoodsReceiveRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateGoodsReceiveResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateGoodsReceiveAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("UpdateGoodsReceive")]
    public async Task<ActionResult<ApiSuccessResult<UpdateGoodsReceiveResult>>> UpdateGoodsReceiveAsync(UpdateGoodsReceiveRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateGoodsReceiveResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateGoodsReceiveAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("DeleteGoodsReceive")]
    public async Task<ActionResult<ApiSuccessResult<DeleteGoodsReceiveResult>>> DeleteGoodsReceiveAsync(DeleteGoodsReceiveRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteGoodsReceiveResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteGoodsReceiveAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetGoodsReceiveList")]
    public async Task<ActionResult<ApiSuccessResult<GetGoodsReceiveListResult>>> GetGoodsReceiveListAsync(
        CancellationToken cancellationToken,
        [FromQuery] bool isDeleted = false,
         [FromQuery] string? locationId = null
        )
    {
        var request = new GetGoodsReceiveListRequest 
        { 
            IsDeleted = isDeleted ,
            LocationId = locationId,
        };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetGoodsReceiveListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetGoodsReceiveListAsync)}",
            Content = response
        });
    }


    [Authorize]
    [HttpGet("GetGoodsReceiveItemList")]
    public async Task<ActionResult<ApiSuccessResult<GetGoodsReceiveItemListResult>>> GetGoodsReceiveItemListAsync(
    [FromQuery] string goodsReceiveId,
    CancellationToken cancellationToken
)
    {
        var request = new GetGoodsReceiveItemListRequest { GoodsReceiveId = goodsReceiveId };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetGoodsReceiveItemListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetGoodsReceiveItemListAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetGoodsReceiveStatusList")]
    public async Task<ActionResult<ApiSuccessResult<GetGoodsReceiveStatusListResult>>> GetGoodsReceiveStatusListAsync(
        CancellationToken cancellationToken
        )
    {
        var request = new GetGoodsReceiveStatusListRequest { };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetGoodsReceiveStatusListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetGoodsReceiveStatusListAsync)}",
            Content = response
        });
    }


    [Authorize]
    [HttpGet("GetGoodsReceiveSingle")]
    public async Task<ActionResult<ApiSuccessResult<GetGoodsReceiveSingleResult>>> GetGoodsReceiveSingleAsync(
    CancellationToken cancellationToken,
    [FromQuery] string id
    )
    {
        var request = new GetGoodsReceiveSingleRequest { Id = id };
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetGoodsReceiveSingleResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetGoodsReceiveSingleAsync)}",
            Content = response
        });
    }
    [HttpGet("GetAllAttributeValues")]
    [ProducesResponseType(typeof(ApiSuccessResult<GlobalAttributeValuesDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiSuccessResult<GlobalAttributeValuesDto>>> GetAllAttributeValuesAsync(CancellationToken cancellationToken)
    {
        var response = await _sender.Send(new GetAllAttributeValuesQuery(), cancellationToken);

        return Ok(new ApiSuccessResult<GlobalAttributeValuesDto>
        {
            Code = StatusCodes.Status200OK,
            Message = "Success fetching all attribute values",
            Content = response
        });
    }

        [HttpPost("searchAttribute")]
        public async Task<IActionResult> SearchAttributeAsync(
        [FromBody] ResolveInventoryByAttributeRequest request,
        CancellationToken ct)
        {
        


            var response = await _sender.Send(request, ct);

            if (response == null)
                return NotFound("No matching inventory found");

                return Ok(new ApiSuccessResult<ResolveInventoryByAttributeResponse>
            {
                Code = StatusCodes.Status200OK,
                Message = $"Success executing {nameof(SearchAttributeAsync)}",
                Content = response
            });
        }

    [Authorize]
    [HttpGet("GetInventoryTransactionAttributes")]
    public async Task<
    ActionResult<ApiSuccessResult<List<CreateNegativeAdjustmentItemDetailDto>>>>
    GetInventoryTransactionAttributesAsync(
        [FromQuery] string moduleId,
        [FromQuery] string productId,
        CancellationToken cancellationToken)
    {
        var request = new GetInventoryTransactionAttributesQuery
        {
            ModuleId = moduleId,
            ProductId = productId
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<List<CreateNegativeAdjustmentItemDetailDto>>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetInventoryTransactionAttributesAsync)}",
            Content = response
        });
    }

}


