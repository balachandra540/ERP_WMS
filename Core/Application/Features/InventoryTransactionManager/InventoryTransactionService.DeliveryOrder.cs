using Application.Common.Extensions;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.InventoryTransactionManager;

public partial class InventoryTransactionService
{
    public async Task<InventoryTransaction> DeliveryOrderCreateInvenTrans(
    string? moduleId,
    string? warehouseId,
    string? productId,
    double? movement,
    string? createdById,
    CancellationToken cancellationToken = default
)
    {
        var parent = await _queryContext.DeliveryOrder
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == moduleId, cancellationToken)
            ?? throw new Exception($"DeliveryOrder not found: {moduleId}");

        var child = new InventoryTransaction
        {
            CreatedById = createdById,
            Number = _numberSequenceService.GenerateNumber(nameof(InventoryTransaction), "", "IVT"),

            ModuleId = parent.Id,
            ModuleName = nameof(DeliveryOrder),
            ModuleCode = "DO",
            ModuleNumber = parent.Number,

            MovementDate = parent.DeliveryDate,
            Status = (InventoryTransactionStatus?)parent.Status,

            WarehouseId = warehouseId,
            ProductId = productId,

            // ✅ SALE = STOCK OUT
            //Movement = -Math.Abs(movement ?? 0)
             Movement = movement 
        };

        CalculateInvenTrans(child);

        await _inventoryTransactionRepository.CreateAsync(child, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }

    public async Task<InventoryTransaction> DeliveryOrderUpdateInvenTrans(
        string? id,
        string? warehouseId,
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

        child.WarehouseId = warehouseId;
        child.ProductId = productId;
        child.Movement = movement;

        CalculateInvenTrans(child);

        _inventoryTransactionRepository.Update(child);
        await _unitOfWork.SaveAsync(cancellationToken);

        return child;
    }

    public async Task<InventoryTransaction> DeliveryOrderDeleteInvenTrans(
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
    public async Task<List<InventoryTransaction>> DeliveryOrderGetInvenTransList(
        string? moduleId,
        string? moduleName,
        CancellationToken cancellationToken = default
        )
    {
        var childs = await _queryContext
            .InventoryTransaction
            .AsNoTracking()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.ModuleId == moduleId && x.ModuleName == moduleName)
            .ToListAsync(cancellationToken);

        return childs;
    }
}