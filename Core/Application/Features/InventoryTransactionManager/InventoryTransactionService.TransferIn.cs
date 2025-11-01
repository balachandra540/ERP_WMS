using Application.Common.Extensions;
using Application.Features.InventoryTransactionManager.Queries;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.InventoryTransactionManager;

public partial class InventoryTransactionService
{
    public async Task<InventoryTransaction> TransferInCreateInvenTrans(
        string? moduleId,
        string? productId,
        double? movement,
        string? createdById,
        CancellationToken cancellationToken = default
        )
    {
        var parent = await _queryContext
            .TransferIn
            .Include(x => x.TransferOut)
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
        child.ModuleName = nameof(TransferIn);
        child.ModuleCode = "TO-IN";
        child.ModuleNumber = parent.Number;
        child.MovementDate = parent.TransferReceiveDate;
        child.Status = (InventoryTransactionStatus?)parent.Status;
        child.WarehouseId = parent.TransferOut!.WarehouseToId;

        child.ProductId = productId;
        child.Movement = movement;

        CalculateInvenTrans(child);

        await _inventoryTransactionRepository.CreateAsync(child, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }

    public async Task<InventoryTransaction> TransferInUpdateInvenTrans(
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

    public async Task<InventoryTransaction> TransferInDeleteInvenTrans(
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
    public async Task<List<ProductStockSummaryDto>> TransferInGetInvenTransList(
    string? moduleId,
    string? moduleName,
    CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(moduleId) || string.IsNullOrEmpty(moduleName))
            return new List<ProductStockSummaryDto>();

        // Base query
        var query = _queryContext.InventoryTransaction
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleId == moduleId && x.ModuleName == moduleName);

        // Check if records exist for given module
        var moduleExists = await query.AnyAsync(cancellationToken);


        // Perform grouping and projection
        var result = await query
            .Select(x => new ProductStockSummaryDto
            {
                Id = x.Id, // Assuming Id types match
                ProductId = x.ProductId,
                TotalMovement = (decimal)(x.Movement ?? 0), // Explicit cast to decimal
                TotalStock = (decimal)(x.Movement ?? 0),      // Explicit cast to decimal
                RequestStock = (decimal)(x.Movement ?? 0) // Explicit cast to decimal
            })
            .ToListAsync(cancellationToken);

        if (!moduleExists && result.Count == 0)
            return new List<ProductStockSummaryDto>();

        return result;
    }
}