using Application.Features.ProductManager.Commands;
using Application.Features.ProductManager.Queries;
using ASPNET.BackEnd.Common.Base;
using ASPNET.BackEnd.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ASPNET.BackEnd.Controllers;

[Route("api/[controller]")]
public class ProductController : BaseApiController
{
    public ProductController(ISender sender) : base(sender)
    {
    }

    [Authorize]
    [HttpPost("CreateProduct")]
    public async Task<ActionResult<ApiSuccessResult<CreateProductResult>>> CreateProductAsync(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateProductResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateProductAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("UpdateProduct")]
    public async Task<ActionResult<ApiSuccessResult<UpdateProductResult>>> UpdateProductAsync(UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateProductResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateProductAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("DeleteProduct")]
    public async Task<ActionResult<ApiSuccessResult<DeleteProductResult>>> DeleteProductAsync(DeleteProductRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteProductResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteProductAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetProductList")]
    public async Task<ActionResult<ApiSuccessResult<GetProductListResult>>> GetProductListAsync(
    CancellationToken cancellationToken,
    [FromQuery] string? warehouseId = null,
      [FromQuery] bool isDeleted = false     
)
    {
        var request = new GetProductListRequest
        {
            IsDeleted = isDeleted,
            WarehouseId = warehouseId  //Add this line
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetProductListAsync)}",
            Content = response
        });
    }

    // --------------------------------------------
    // PRODUCT PRICE DEFINITION
    // --------------------------------------------

    [Authorize]
    [HttpGet("GetProductPriceDefinitionList")]
    public async Task<ActionResult<ApiSuccessResult<GetProductPriceDefinitionListResult>>> GetProductPriceDefinitionListAsync(CancellationToken cancellationToken)
    {
        var request = new GetProductPriceDefinitionListRequest();

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductPriceDefinitionListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetProductPriceDefinitionListAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("CreateProductPriceDefinition")]
    public async Task<ActionResult<ApiSuccessResult<CreateProductPriceDefinitionResult>>> CreateProductPriceDefinitionAsync(
        CreateProductPriceDefinitionRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<CreateProductPriceDefinitionResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(CreateProductPriceDefinitionAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("UpdateProductPriceDefinition")]
    public async Task<ActionResult<ApiSuccessResult<UpdateProductPriceDefinitionResult>>> UpdateProductPriceDefinitionAsync(
        UpdateProductPriceDefinitionRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<UpdateProductPriceDefinitionResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(UpdateProductPriceDefinitionAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpPost("DeleteProductPriceDefinition")]
    public async Task<ActionResult<ApiSuccessResult<DeleteProductPriceDefinitionResult>>> DeleteProductPriceDefinitionAsync(
        DeleteProductPriceDefinitionRequest request, CancellationToken cancellationToken)
    {
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<DeleteProductPriceDefinitionResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(DeleteProductPriceDefinitionAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetInventoryProductList")]
    public async Task<ActionResult<ApiSuccessResult<GetProductListResult>>> GetInventoryProductListAsync(
    CancellationToken cancellationToken,
    [FromQuery] string? warehouseId = null,
    [FromQuery] bool isDeleted = false
)
    {
        var request = new GetInventoryProductListRequest
        {
            IsDeleted = isDeleted,
            WarehouseId = warehouseId
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetInventoryProductListAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetActiveProductPriceDefinitionList")]
    public async Task<ActionResult<ApiSuccessResult<GetProductPriceDefinitionListResult>>> GetActiveProductPriceDefinitionListAsync(
    CancellationToken cancellationToken)
    {
        var request = new GetProductPriceDefinitionListRequest();
        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductPriceDefinitionListResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetProductPriceDefinitionListAsync)}",
            Content = response
        });
    }

    [Authorize]
    [HttpGet("GetProductIdByPLU")]
    public async Task<ActionResult<ApiSuccessResult<GetProductIdByPLUResult>>> GetProductIdByPLUAsync(
    [FromQuery] int plu,
    CancellationToken cancellationToken)
    {
        var request = new GetProductIdByPLURequest(plu);

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<GetProductIdByPLUResult>
        {
            Code = StatusCodes.Status200OK,
            Message = $"Success executing {nameof(GetProductIdByPLUAsync)}",
            Content = response
        });
    }
    [HttpGet("GetProductStockByProductId")]
    public async Task<ActionResult<ApiSuccessResult<ProductStockSummaryDto>>> GetProductStockByProductIdAsync(
        [FromQuery] string? imei1,
        [FromQuery] string? imei2,
        [FromQuery] string? serviceNo,
        [FromQuery] string productId,
        [FromQuery] string locationId,

        CancellationToken cancellationToken)
    {
        var request = new GetProductStockByProductIdRequest
        {
            IMEI1 = imei1,
            IMEI2 = imei2,
            ServiceNo = serviceNo,
            ProductId = productId,   
            warehouseId = locationId
        };

        var response = await _sender.Send(request, cancellationToken);

        return Ok(new ApiSuccessResult<ProductStockSummaryDto>
        {
            Code = StatusCodes.Status200OK,
            Message = "IMEI / ServiceNo validation executed successfully",
            Content = response
        });
    }

    //[HttpGet("checkIMEIorServiceNoExistOrNot")]
    //public async Task<ActionResult<ApiSuccessResult<CheckDetailValueExistResult>>>
    //CheckIMEIorServiceNoExistOrNot(
    //    [FromQuery] string value,
    //    CancellationToken cancellationToken)
    //{
    //    var request = new CheckDetailValueExistRequest
    //    {
    //        Value = value
    //    };

    //    var response = await _sender.Send(request, cancellationToken);

    //    return Ok(new ApiSuccessResult<CheckDetailValueExistResult>
    //    {
    //        Code = StatusCodes.Status200OK,
    //        Message = "Validation executed successfully",
    //        Content = response
    //    });
    //}

    //public async Task<ActionResult<ApiSuccessResult<GetProductAndGoodsReceiveByPluResult>>>
    //GetProductAndGoodsReceiveByPluAsync(
    //    [FromQuery] int plu,
    //    CancellationToken cancellationToken)
    //{
    //    var request = new GetProductAndGoodsReceiveByPluRequest
    //    {
    //        Plu = plu
    //    };

    //    var response = await _sender.Send(request, cancellationToken);

    //    return Ok(new ApiSuccessResult<GetProductAndGoodsReceiveByPluResult>
    //    {
    //        Code = StatusCodes.Status200OK,
    //        Message = $"Success executing {nameof(GetProductAndGoodsReceiveByPluAsync)}",
    //        Content = response
    //    });
    //}

}


