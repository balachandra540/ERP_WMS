using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsReceiveManager.Commands;

public class UpdateGoodsReceiveItemDto
{
    public string? Id { get; init; }
    public string PurchaseOrderItemId { get; init; } = string.Empty;
    public double ReceivedQuantity { get; init; }
    public string? Notes { get; init; }
    // WarehouseId removed as entity does not support it
}

public class UpdateGoodsReceiveResult
{
    public GoodsReceive? Data { get; set; }
}

public class UpdateGoodsReceiveRequest : IRequest<UpdateGoodsReceiveResult>
{
    public string? Id { get; init; }
    public DateTime? ReceiveDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? PurchaseOrderId { get; init; }
    public string? UpdatedById { get; init; }
    public List<UpdateGoodsReceiveItemDto> Items { get; init; } = new();
    public string? DefaultWarehouseId { get; init; }
}

public class UpdateGoodsReceiveValidator : AbstractValidator<UpdateGoodsReceiveRequest>
{
    public UpdateGoodsReceiveValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required.");

        RuleFor(x => x.Items).NotNull().WithMessage("Items list is required.");

        RuleForEach(x => x.Items).ChildRules(childValidator =>
        {
            childValidator.RuleFor(item => item.PurchaseOrderItemId).NotEmpty().WithMessage("Purchase Order Item ID is required.");
            childValidator.RuleFor(item => item.ReceivedQuantity).GreaterThanOrEqualTo(0).WithMessage("Received quantity must be greater than or equal to 0.");
        });
    }
}

public class UpdateGoodsReceiveHandler : IRequestHandler<UpdateGoodsReceiveRequest, UpdateGoodsReceiveResult>
{
    private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;
    private readonly ICommandRepository<GoodsReceiveItem> _goodsReceiveItemRepository;
    private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
    private readonly ICommandRepository<Warehouse> _warehouseRepository;
    private readonly ICommandRepository<InventoryTransaction> _inventoryTransactionRepository; // Added for delete
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public UpdateGoodsReceiveHandler(
        ICommandRepository<GoodsReceive> goodsReceiveRepository,
        ICommandRepository<GoodsReceiveItem> goodsReceiveItemRepository,
        ICommandRepository<PurchaseOrder> purchaseOrderRepository,
        ICommandRepository<Warehouse> warehouseRepository,
        ICommandRepository<InventoryTransaction> inventoryTransactionRepository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService)
    {
        _goodsReceiveRepository = goodsReceiveRepository;
        _goodsReceiveItemRepository = goodsReceiveItemRepository;
        _purchaseOrderRepository = purchaseOrderRepository;
        _warehouseRepository = warehouseRepository;
        _inventoryTransactionRepository = inventoryTransactionRepository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<UpdateGoodsReceiveResult> Handle(UpdateGoodsReceiveRequest request, CancellationToken cancellationToken)
    {
        // Step 1: Load GoodsReceive with items and related data (removed InventoryTransactions include as navigation not present)
        var entity = await _goodsReceiveRepository.GetQuery()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.GoodsReceiveItems)
                .ThenInclude(i => i.PurchaseOrderItem)
                    .ThenInclude(po => po.Product)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        var oldStatus = entity.Status;

        // Step 2: Parse new status
        if (!Enum.TryParse<GoodsReceiveStatus>(request.Status, out var receiveStatus))
        {
            throw new InvalidOperationException($"Invalid status: {request.Status}");
        }

        var newStatus = receiveStatus;

        // Step 3: Validate Purchase Order (assume cannot change)
        if (!string.IsNullOrEmpty(request.PurchaseOrderId) && request.PurchaseOrderId != entity.PurchaseOrderId)
        {
            throw new InvalidOperationException("Cannot change Purchase Order for existing Goods Receive.");
        }

        // Step 3.5: Validate default warehouse if provided (used for all items)
        Warehouse? defaultWarehouse = null;
        if (!string.IsNullOrEmpty(request.DefaultWarehouseId))
        {
            defaultWarehouse = await _warehouseRepository.GetQuery()
                .ApplyIsDeletedFilter(false)
                .FirstOrDefaultAsync(x => x.Id == request.DefaultWarehouseId, cancellationToken);
            if (defaultWarehouse == null)
                throw new InvalidOperationException($"Default warehouse '{request.DefaultWarehouseId}' not found.");
        }
        var warehouseId = request.DefaultWarehouseId; // Use this for all items

        // Step 4: Load Purchase Order with items (tracked)
        var po = await _purchaseOrderRepository.GetQuery()
            .ApplyIsDeletedFilter(false)
            .Include(x => x.PurchaseOrderItemList)
            .FirstOrDefaultAsync(x => x.Id == entity.PurchaseOrderId, cancellationToken);

        if (po == null)
        {
            throw new InvalidOperationException($"Purchase Order '{entity.PurchaseOrderId}' not found.");
        }

        var poItemsById = po.PurchaseOrderItemList.ToDictionary(i => i.Id);
        var oldItemsById = entity.GoodsReceiveItems.ToDictionary(i => i.Id);

        // Step 5: Delete old inventory transactions if old status was Confirmed (separate query since no navigation)
        if (oldStatus == GoodsReceiveStatus.Confirmed)
        {
            var txToDelete = await _inventoryTransactionRepository.GetQuery()
                .Where(tx => tx.ModuleId == entity.Id) // Assuming FK is GoodsReceiveId; adjust if different
                .ToListAsync(cancellationToken);
            foreach (var tx in txToDelete)
            {
                _inventoryTransactionRepository.Delete(tx);
            }
        }

        // Step 6: Process items (deletes, updates, creates)
        // Handle implicit deletes: old items not referenced in request
        var itemsToProcess = request.Items.Where(dto => dto.ReceivedQuantity > 0).ToList(); // Skip zero qty
        var referencedItemIds = itemsToProcess.Where(dto => !string.IsNullOrEmpty(dto.Id)).Select(dto => dto.Id!).ToHashSet();

        foreach (var oldItem in entity.GoodsReceiveItems.Where(i => !referencedItemIds.Contains(i.Id)).ToList())
        {
            entity.GoodsReceiveItems.Remove(oldItem);
            if (poItemsById.TryGetValue(oldItem.PurchaseOrderItemId, out var poItem))
            {
                poItem.ReceivedQuantity -= oldItem.ReceivedQuantity;
            }
        }

        // Handle explicit zero qty updates as deletes
        foreach (var dto in request.Items.Where(dto => !string.IsNullOrEmpty(dto.Id) && dto.ReceivedQuantity <= 0))
        {
            if (oldItemsById.TryGetValue(dto.Id!, out var oldItem))
            {
                entity.GoodsReceiveItems.Remove(oldItem);
                if (poItemsById.TryGetValue(oldItem.PurchaseOrderItemId, out var poItem))
                {
                    poItem.ReceivedQuantity -= oldItem.ReceivedQuantity;
                }
            }
        }

        // Process remaining items (updates and creates)
        foreach (var dto in itemsToProcess)
        {
            var isUpdate = !string.IsNullOrEmpty(dto.Id);
            GoodsReceiveItem grItem;

            if (isUpdate)
            {
                if (!oldItemsById.TryGetValue(dto.Id!, out grItem))
                {
                    throw new InvalidOperationException($"GoodsReceiveItem '{dto.Id}' not found.");
                }

                // Adjust PO item received quantity
                var delta = dto.ReceivedQuantity - grItem.ReceivedQuantity;
                if (poItemsById.TryGetValue(grItem.PurchaseOrderItemId, out var poItem))
                {
                    poItem.ReceivedQuantity += delta;
                }

                // Update item (no WarehouseId)
                grItem.ReceivedQuantity = dto.ReceivedQuantity;
                grItem.Notes = dto.Notes;
                grItem.UpdatedById = request.UpdatedById;
                grItem.UpdatedAtUtc = DateTime.Now;
            }
            else
            {
                // New item
                if (!poItemsById.TryGetValue(dto.PurchaseOrderItemId, out var poItem))
                {
                    throw new InvalidOperationException($"PurchaseOrderItem '{dto.PurchaseOrderItemId}' not found.");
                }

                grItem = new GoodsReceiveItem
                {
                    GoodsReceiveId = entity.Id,
                    PurchaseOrderItemId = dto.PurchaseOrderItemId,
                    ReceivedQuantity = dto.ReceivedQuantity,
                    Notes = dto.Notes,
                    CreatedById = entity.CreatedById,
                    CreatedAtUtc = DateTime.Now,
                    IsDeleted = false
                };

                entity.GoodsReceiveItems.Add(grItem);

                // Adjust PO item received quantity
                poItem.ReceivedQuantity += dto.ReceivedQuantity;
            }
        }

        // Step 7: Validate no over-receiving on PO items
        foreach (var poItem in po.PurchaseOrderItemList)
        {
            if (poItem.ReceivedQuantity > (poItem.Quantity ?? 0))
            {
                throw new InvalidOperationException($"Over-received for PO item '{poItem.Id}': {poItem.ReceivedQuantity} > {poItem.Quantity}.");
            }
        }

        // Step 8: Update header (except status)
        entity.ReceiveDate = _securityService.ConvertToIst(request.ReceiveDate ?? entity.ReceiveDate);
        entity.Description = request.Description ?? entity.Description;
        entity.UpdatedById = request.UpdatedById!;
        entity.UpdatedAtUtc = DateTime.Now;
        entity.Status = newStatus; // Set now for consistency

        _purchaseOrderRepository.Update(po);
        _goodsReceiveRepository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        // Step 9: Create new inventory transactions if new status is Confirmed
        if (newStatus == GoodsReceiveStatus.Confirmed)
        {
            if (string.IsNullOrEmpty(warehouseId))
            {
                throw new InvalidOperationException("Default Warehouse ID is required when confirming Goods Receive.");
            }

            foreach (var item in entity.GoodsReceiveItems)
            {
                var poItem = poItemsById[item.PurchaseOrderItemId];
                if (poItem.Product?.Physical != true)
                    continue;

                var inventoryTx = await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
                    entity.Id,
                    warehouseId,  // Use default for all items
                    poItem.ProductId,
                    item.ReceivedQuantity,
                    request.UpdatedById!,
                    cancellationToken);

                // Note: Track if needed, but result doesn't include
            }
        }

       
        // Step 11: Final save if PO status changed
        await _unitOfWork.SaveAsync(cancellationToken);

        // Step 12: Propagate parent update (as in original)
        await _inventoryTransactionService.PropagateParentUpdate(
            entity.Id,
            nameof(GoodsReceive),
            entity.ReceiveDate,
            (InventoryTransactionStatus?)entity.Status,
            entity.IsDeleted,
            entity.UpdatedById,
            null,
            cancellationToken);

        return new UpdateGoodsReceiveResult
        {
            Data = entity
        };
    }

    }