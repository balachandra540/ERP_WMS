using Application.Common.Extensions;
using Application.Features.InventoryTransactionManager.Queries;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System;

namespace Application.Features.InventoryTransactionManager;

public partial class InventoryTransactionService
{
    public async Task<InventoryTransaction> TransferOutCreateInvenTrans(
        string? moduleId,
        string? productId,
        double? movement,
        string? createdById,
        CancellationToken cancellationToken = default
        )
    {
        var parent = await _queryContext
            .TransferOut
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == moduleId, cancellationToken);

        if (parent == null)
        {
            throw new Exception($"Parent entity not found: {moduleId}");
        }

        var child = new InventoryTransaction();
        child.CreatedById = createdById;

        child.Number = _numberSequenceService.GenerateNumber(nameof(InventoryTransaction), "", "IVT");
        child.ModuleId = parent.Id;
        child.ModuleName = nameof(TransferOut);
        child.ModuleCode = "TO-OUT";
        child.ModuleNumber = parent.Number;
        child.MovementDate = parent.TransferReleaseDate;
        child.Status = (InventoryTransactionStatus?)parent.Status;
        child.WarehouseId = parent.WarehouseFromId;

        child.ProductId = productId;
        child.Movement = movement;

        CalculateInvenTrans(child);

        await _inventoryTransactionRepository.CreateAsync(child, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }

    public async Task<InventoryTransaction> TransferOutUpdateInvenTrans(
        string? id,
        string? productId,
        double? movement,
        string? updatedById,
        CancellationToken cancellationToken = default
        )
    {
        var child = await _inventoryTransactionRepository.GetAsync(id ?? string.Empty, cancellationToken);

        if (child == null)
        {
            throw new Exception($"Child entity not found: {id}");
        }

        child.UpdatedById = updatedById;

        child.ProductId = productId;
        child.Movement = movement;

        CalculateInvenTrans(child);

        _inventoryTransactionRepository.Update(child);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }

    public async Task<InventoryTransaction> TransferOutDeleteInvenTrans(
        string? id,
        string? updatedById,
        CancellationToken cancellationToken = default
        )
    {
        var child = await _inventoryTransactionRepository.GetAsync(id ?? string.Empty, cancellationToken);

        if (child == null)
        {
            throw new Exception($"Child entity not found: {id}");
        }

        child.UpdatedById = updatedById;

        _inventoryTransactionRepository.Delete(child);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }
    public async Task<List<ProductStockSummaryDto>> TransferOutGetInvenTransList(
    string? moduleId,
    string? moduleName,
    bool onlyConfirmed = false,
    CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(moduleId) || string.IsNullOrEmpty(moduleName))
            return new List<ProductStockSummaryDto>();

        // Base query
        var query = _queryContext.InventoryTransaction
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleId == moduleId && x.ModuleName == moduleName);

        // Apply filter conditionally based on the flag
        if (onlyConfirmed)
            query = query.Where(x => x.Status == InventoryTransactionStatus.Confirmed);

        // Project directly to ProductStockSummaryDto
        //var result = await query
        //    .Select(x => new ProductStockSummaryDto
        //    {
        //        Id = x.Id, // Assuming Id types match
        //        ProductId = x.ProductId,
        //        TotalMovement = (decimal)(x.Movement ?? 0), // Explicit cast to decimal
        //        TotalStock = (decimal)(x.Movement ?? 0),      // Explicit cast to decimal
        //        RequestStock = (decimal)(x.Movement ?? 0) // Explicit cast to decimal
        //    })
        //    .ToListAsync(cancellationToken);

        var result = await (
    from it in query // your existing InventoryTransaction query
    join attr in _queryContext.InventoryTransactionAttributesDetails
        on it.Id equals attr.InventoryTransactionId
    join gr in _queryContext.GoodsReceiveItemDetails
        on attr.GoodsReceiveItemDetailsId equals gr.Id
    group gr by new
    {
        it.Id,
        it.ProductId,
        it.Movement
    }
    into g
    select new ProductStockSummaryDto
    {
        Id = g.Key.Id,
        ProductId = g.Key.ProductId ?? "",
        RequestStock = (decimal)(g.Key.Movement ?? 0),

        DetailEntries = g.Select(x => new ProductDetailEntryDto
        {
            GoodsReceiveItemDetailsId = x.Id,
            IMEI1 = x.IMEI1 ?? "",
            IMEI2 = x.IMEI2 ?? "",
            ServiceNo = x.ServiceNo ?? ""
        }).ToList()
    }).ToListAsync(cancellationToken);

        //select new ProductStockSummaryDto
        //{
        //    // InventoryTransaction Id
        //    Id = it.Id,

        //    ProductId = it.ProductId ?? "",

        //    //GoodsReceiveItemDetails fields
        //    GoodsReceiveItemDetailsId = gr.Id,
        //     IMEI1 = gr.IMEI1 ?? "",
        //    IMEI2 = gr.IMEI2 ?? "",
        //    ServiceNo = gr.ServiceNo ?? "",

        //    // Stock values
        //    TotalMovement = (decimal)(it.Movement ?? 0),
        //    TotalStock = (decimal)(it.Movement ?? 0),
        //    RequestStock = (decimal)(it.Movement ?? 0)
        //}
        //).ToListAsync(cancellationToken);

        return result;
    }



    public async Task<List<ProductStockSummaryDto>> FromWarehouseId(
    string? warehouseId,
    CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(warehouseId))
            return new List<ProductStockSummaryDto>();

        var result = await _queryContext
            .InventoryTransaction
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.Status == InventoryTransactionStatus.Confirmed &&
                        x.WarehouseId == warehouseId)
            .GroupBy(x => x.ProductId)
            .Select(g => new ProductStockSummaryDto
            {
                ProductId = g.Key,
                TotalStock = (decimal)(g.Sum(x => x.Stock) ?? 0),
                TotalMovement = (decimal)(g.Sum(x => x.Movement) ?? 0),
                RequestStock = 0
            })
            // ✅ Only include records where stock > 0
            .Where(dto => dto.TotalStock > 0)
            .ToListAsync(cancellationToken);

        return result;
    }

}