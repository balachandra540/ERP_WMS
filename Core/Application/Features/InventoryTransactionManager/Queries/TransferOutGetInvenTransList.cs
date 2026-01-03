using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.InventoryTransactionManager.Queries;

// ======================================================
// EXISTING QUERY - TransferOutGetInvenTransList
// ======================================================
public class TransferOutGetInvenTransListResult
{
    public List<ProductStockSummaryDto>? Data { get; set; }
}

public class TransferOutGetInvenTransListRequest : IRequest<TransferOutGetInvenTransListResult>
{
    public string? ModuleId { get; init; }
    public bool OnlyConfirmed { get; init; } = false;

}

public class TransferOutGetInvenTransListValidator : AbstractValidator<TransferOutGetInvenTransListRequest>
{
    public TransferOutGetInvenTransListValidator()
    {
        RuleFor(x => x.ModuleId).NotEmpty();
    }
}

public class TransferOutGetInvenTransListHandler
    : IRequestHandler<TransferOutGetInvenTransListRequest, TransferOutGetInvenTransListResult>
{
    private readonly InventoryTransactionService _inventoryTransactionService;

    public TransferOutGetInvenTransListHandler(InventoryTransactionService inventoryTransactionService)
    {
        _inventoryTransactionService = inventoryTransactionService;
    }

    public async Task<TransferOutGetInvenTransListResult> Handle(
        TransferOutGetInvenTransListRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await _inventoryTransactionService.TransferOutGetInvenTransList(
            request.ModuleId,
            nameof(TransferOut),
            request.OnlyConfirmed,
            cancellationToken);

        return new TransferOutGetInvenTransListResult
        {
            Data = entity
        };
    }
}


// ======================================================
// NEW QUERY - FromWarehouseId
// ======================================================

public class FromWarehouseIdResult
{
    public List<ProductStockSummaryDto> Data { get; set; }
}
public class ProductStockSummaryDto
{
    public string Id { get; set; } // Adjust type if ProductId is int or Guid
    public string ProductId { get; set; }
    public decimal TotalStock { get; set; }
    public decimal TotalMovement { get; set; } // Assuming Movement is double? and summed
    public decimal RequestStock { get; set; }

    public List<ProductDetailEntryDto> DetailEntries { get; set; } = new();
}

public class ProductDetailEntryDto
{
    public string GoodsReceiveItemDetailsId { get; set; }
    public string IMEI1 { get; set; }
    public string IMEI2 { get; set; }
    public string ServiceNo { get; set; }
}
public class FromWarehouseIdRequest : IRequest<FromWarehouseIdResult>
{
    public string? WarehouseId { get; set; }
}
public class FromWarehouseIdHandler : IRequestHandler<FromWarehouseIdRequest, FromWarehouseIdResult>
{
    private readonly InventoryTransactionService _inventoryTransactionService;

    public FromWarehouseIdHandler(InventoryTransactionService inventoryTransactionService)
    {
        _inventoryTransactionService = inventoryTransactionService;
    }

    public async Task<FromWarehouseIdResult> Handle(
        FromWarehouseIdRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await _inventoryTransactionService.FromWarehouseId(
            request.WarehouseId,
            cancellationToken);

        return new FromWarehouseIdResult
        {
            Data = entity
        };
    }
}