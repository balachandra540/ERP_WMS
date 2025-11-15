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

}


