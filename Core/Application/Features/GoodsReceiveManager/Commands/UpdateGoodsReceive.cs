//using Application.Common.Extensions;
//using Application.Common.Repositories;
//using Application.Common.Services.SecurityManager;
//using Application.Features.InventoryTransactionManager;
//using Application.Features.NumberSequenceManager;
//using Domain.Entities;
//using Domain.Enums;
//using FluentValidation;
//using MediatR;
//using Microsoft.EntityFrameworkCore;

//namespace Application.Features.GoodsReceiveManager.Commands;

//public class UpdateGoodsReceiveItemDto
//{
//    public string? Id { get; init; }
//    public string PurchaseOrderItemId { get; init; } = string.Empty;
//    public double ReceivedQuantity { get; init; }
//    public string? Notes { get; init; }
//    // WarehouseId removed as entity does not support it
//}

//public class UpdateGoodsReceiveResult
//{
//    public GoodsReceive? Data { get; set; }
//}

//public class UpdateGoodsReceiveRequest : IRequest<UpdateGoodsReceiveResult>
//{
//    public string? Id { get; init; }
//    public DateTime? ReceiveDate { get; init; }
//    public string? Status { get; init; }
//    public string? Description { get; init; }
//    public string? PurchaseOrderId { get; init; }
//    public string? UpdatedById { get; init; }
//    public List<UpdateGoodsReceiveItemDto> Items { get; init; } = new();
//    public string? DefaultWarehouseId { get; init; }
//}

//public class UpdateGoodsReceiveValidator : AbstractValidator<UpdateGoodsReceiveRequest>
//{
//    public UpdateGoodsReceiveValidator()
//    {
//        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required.");

//        RuleFor(x => x.Items).NotNull().WithMessage("Items list is required.");

//        RuleForEach(x => x.Items).ChildRules(childValidator =>
//        {
//            childValidator.RuleFor(item => item.PurchaseOrderItemId).NotEmpty().WithMessage("Purchase Order Item ID is required.");
//            childValidator.RuleFor(item => item.ReceivedQuantity).GreaterThanOrEqualTo(0).WithMessage("Received quantity must be greater than or equal to 0.");
//        });
//    }
//}

//public class UpdateGoodsReceiveHandler : IRequestHandler<UpdateGoodsReceiveRequest, UpdateGoodsReceiveResult>
//{
//    private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;
//    private readonly ICommandRepository<GoodsReceiveItem> _goodsReceiveItemRepository;
//    private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
//    private readonly ICommandRepository<Warehouse> _warehouseRepository;
//    private readonly ICommandRepository<InventoryTransaction> _inventoryTransactionRepository; // Added for delete
//    private readonly IUnitOfWork _unitOfWork;
//    private readonly InventoryTransactionService _inventoryTransactionService;
//    private readonly ISecurityService _securityService;

//    public UpdateGoodsReceiveHandler(
//        ICommandRepository<GoodsReceive> goodsReceiveRepository,
//        ICommandRepository<GoodsReceiveItem> goodsReceiveItemRepository,
//        ICommandRepository<PurchaseOrder> purchaseOrderRepository,
//        ICommandRepository<Warehouse> warehouseRepository,
//        ICommandRepository<InventoryTransaction> inventoryTransactionRepository,
//        IUnitOfWork unitOfWork,
//        InventoryTransactionService inventoryTransactionService,
//        ISecurityService securityService)
//    {
//        _goodsReceiveRepository = goodsReceiveRepository;
//        _goodsReceiveItemRepository = goodsReceiveItemRepository;
//        _purchaseOrderRepository = purchaseOrderRepository;
//        _warehouseRepository = warehouseRepository;
//        _inventoryTransactionRepository = inventoryTransactionRepository;
//        _unitOfWork = unitOfWork;
//        _inventoryTransactionService = inventoryTransactionService;
//        _securityService = securityService;
//    }

//    public async Task<UpdateGoodsReceiveResult> Handle(UpdateGoodsReceiveRequest request, CancellationToken cancellationToken)
//    {
//        // Step 1: Load GoodsReceive with items and related data (removed InventoryTransactions include as navigation not present)
//        var entity = await _goodsReceiveRepository.GetQuery()
//            .ApplyIsDeletedFilter(false)
//            .Include(x => x.GoodsReceiveItems)
//                .ThenInclude(i => i.PurchaseOrderItem)
//                    .ThenInclude(po => po.Product)
//            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

//        if (entity == null)
//        {
//            throw new Exception($"Entity not found: {request.Id}");
//        }

//        var oldStatus = entity.Status;

//        // Step 2: Parse new status
//        if (!Enum.TryParse<GoodsReceiveStatus>(request.Status, out var receiveStatus))
//        {
//            throw new InvalidOperationException($"Invalid status: {request.Status}");
//        }

//        var newStatus = receiveStatus;

//        // Step 3: Validate Purchase Order (assume cannot change)
//        if (!string.IsNullOrEmpty(request.PurchaseOrderId) && request.PurchaseOrderId != entity.PurchaseOrderId)
//        {
//            throw new InvalidOperationException("Cannot change Purchase Order for existing Goods Receive.");
//        }

//        // Step 3.5: Validate default warehouse if provided (used for all items)
//        Warehouse? defaultWarehouse = null;
//        if (!string.IsNullOrEmpty(request.DefaultWarehouseId))
//        {
//            defaultWarehouse = await _warehouseRepository.GetQuery()
//                .ApplyIsDeletedFilter(false)
//                .FirstOrDefaultAsync(x => x.Id == request.DefaultWarehouseId, cancellationToken);
//            if (defaultWarehouse == null)
//                throw new InvalidOperationException($"Default warehouse '{request.DefaultWarehouseId}' not found.");
//        }
//        var warehouseId = request.DefaultWarehouseId; // Use this for all items

//        // Step 4: Load Purchase Order with items (tracked)
//        var po = await _purchaseOrderRepository.GetQuery()
//            .ApplyIsDeletedFilter(false)
//            .Include(x => x.PurchaseOrderItemList)
//            .FirstOrDefaultAsync(x => x.Id == entity.PurchaseOrderId, cancellationToken);

//        if (po == null)
//        {
//            throw new InvalidOperationException($"Purchase Order '{entity.PurchaseOrderId}' not found.");
//        }

//        var poItemsById = po.PurchaseOrderItemList.ToDictionary(i => i.Id);
//        var oldItemsById = entity.GoodsReceiveItems.ToDictionary(i => i.Id);

//        // Step 5: Delete old inventory transactions if old status was Confirmed (separate query since no navigation)
//        if (oldStatus == GoodsReceiveStatus.Approved)
//        {
//            var txToDelete = await _inventoryTransactionRepository.GetQuery()
//                .Where(tx => tx.ModuleId == entity.Id) // Assuming FK is GoodsReceiveId; adjust if different
//                .ToListAsync(cancellationToken);
//            foreach (var tx in txToDelete)
//            {
//                _inventoryTransactionRepository.Delete(tx);
//            }
//        }

//        // Step 6: Process items (deletes, updates, creates)
//        // Handle implicit deletes: old items not referenced in request
//        var itemsToProcess = request.Items.Where(dto => dto.ReceivedQuantity > 0).ToList(); // Skip zero qty
//        var referencedItemIds = itemsToProcess.Where(dto => !string.IsNullOrEmpty(dto.Id)).Select(dto => dto.Id!).ToHashSet();

//        foreach (var oldItem in entity.GoodsReceiveItems.Where(i => !referencedItemIds.Contains(i.Id)).ToList())
//        {
//            entity.GoodsReceiveItems.Remove(oldItem);
//            if (poItemsById.TryGetValue(oldItem.PurchaseOrderItemId, out var poItem))
//            {
//                poItem.ReceivedQuantity -= oldItem.ReceivedQuantity;
//            }
//        }

//        // Handle explicit zero qty updates as deletes
//        foreach (var dto in request.Items.Where(dto => !string.IsNullOrEmpty(dto.Id) && dto.ReceivedQuantity <= 0))
//        {
//            if (oldItemsById.TryGetValue(dto.Id!, out var oldItem))
//            {
//                entity.GoodsReceiveItems.Remove(oldItem);
//                if (poItemsById.TryGetValue(oldItem.PurchaseOrderItemId, out var poItem))
//                {
//                    poItem.ReceivedQuantity -= oldItem.ReceivedQuantity;
//                }
//            }
//        }

//        // Process remaining items (updates and creates)
//        foreach (var dto in itemsToProcess)
//        {
//            var isUpdate = !string.IsNullOrEmpty(dto.Id);
//            GoodsReceiveItem grItem;

//            if (isUpdate)
//            {
//                if (!oldItemsById.TryGetValue(dto.Id!, out grItem))
//                {
//                    throw new InvalidOperationException($"GoodsReceiveItem '{dto.Id}' not found.");
//                }

//                // Adjust PO item received quantity
//                var delta = dto.ReceivedQuantity - grItem.ReceivedQuantity;
//                if (poItemsById.TryGetValue(grItem.PurchaseOrderItemId, out var poItem))
//                {
//                    poItem.ReceivedQuantity += delta;
//                }

//                // Update item (no WarehouseId)
//                grItem.ReceivedQuantity = dto.ReceivedQuantity;
//                grItem.Notes = dto.Notes;
//                grItem.UpdatedById = request.UpdatedById;
//                grItem.UpdatedAtUtc = DateTime.Now;
//            }
//            else
//            {
//                // New item
//                if (!poItemsById.TryGetValue(dto.PurchaseOrderItemId, out var poItem))
//                {
//                    throw new InvalidOperationException($"PurchaseOrderItem '{dto.PurchaseOrderItemId}' not found.");
//                }

//                grItem = new GoodsReceiveItem
//                {
//                    GoodsReceiveId = entity.Id,
//                    PurchaseOrderItemId = dto.PurchaseOrderItemId,
//                    ReceivedQuantity = dto.ReceivedQuantity,
//                    Notes = dto.Notes,
//                    CreatedById = entity.CreatedById,
//                    CreatedAtUtc = DateTime.Now,
//                    IsDeleted = false
//                };

//                entity.GoodsReceiveItems.Add(grItem);

//                // Adjust PO item received quantity
//                poItem.ReceivedQuantity += dto.ReceivedQuantity;
//            }
//        }

//        // Step 7: Validate no over-receiving on PO items
//        foreach (var poItem in po.PurchaseOrderItemList)
//        {
//            if (poItem.ReceivedQuantity > (poItem.Quantity ?? 0))
//            {
//                throw new InvalidOperationException($"Over-received for PO item '{poItem.Id}': {poItem.ReceivedQuantity} > {poItem.Quantity}.");
//            }
//        }

//        // Step 8: Update header (except status)
//        entity.ReceiveDate = _securityService.ConvertToIst(request.ReceiveDate ?? entity.ReceiveDate);
//        entity.Description = request.Description ?? entity.Description;
//        entity.UpdatedById = request.UpdatedById!;
//        entity.UpdatedAtUtc = DateTime.Now;
//        entity.Status = newStatus; // Set now for consistency

//        _purchaseOrderRepository.Update(po);
//        _goodsReceiveRepository.Update(entity);
//        await _unitOfWork.SaveAsync(cancellationToken);

//        // Step 9: Create new inventory transactions if new status is Confirmed
//        if (newStatus == GoodsReceiveStatus.Approved)
//        {
//            if (string.IsNullOrEmpty(warehouseId))
//            {
//                throw new InvalidOperationException("Default Warehouse ID is required when confirming Goods Receive.");
//            }

//            foreach (var item in entity.GoodsReceiveItems)
//            {
//                var poItem = poItemsById[item.PurchaseOrderItemId];
//                if (poItem.Product?.Physical != true)
//                    continue;

//                var inventoryTx = await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
//                    entity.Id,
//                    warehouseId,  // Use default for all items
//                    poItem.ProductId,
//                    item.ReceivedQuantity,
//                    request.UpdatedById!,
//                    cancellationToken);

//                // Note: Track if needed, but result doesn't include
//            }
//        }


//        // Step 11: Final save if PO status changed
//        await _unitOfWork.SaveAsync(cancellationToken);

//        // Step 12: Propagate parent update (as in original)
//        await _inventoryTransactionService.PropagateParentUpdate(
//            entity.Id,
//            nameof(GoodsReceive),
//            entity.ReceiveDate,
//            (InventoryTransactionStatus?)entity.Status,
//            entity.IsDeleted,
//            entity.UpdatedById,
//            null,
//            cancellationToken);

//        return new UpdateGoodsReceiveResult
//        {
//            Data = entity
//        };
//    }

//    }

using Application.Common.CQS.Queries;
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
using Microsoft.EntityFrameworkCore.Query;
using System.Text.RegularExpressions;
using System.Threading;

namespace Application.Features.GoodsReceiveManager.Commands;

public class UpdateGoodsReceiveItemDto
{
    public string? Id { get; init; }
    public string PurchaseOrderItemId { get; init; } = string.Empty;
    public double ReceivedQuantity { get; init; }
    public double? UnitPrice { get; init; }
    public double? TaxAmount { get; init; }
    public double? FinalUnitPrice { get; init; }
    public double? MRP { get; init; }
    public string? Notes { get; init; }
    public string? Attribute1DetailId { get; init; }
    public string? Attribute2DetailId { get; init; }

    public List<UpdateGoodsReceiveItemDetailDto> Attributes { get; init; } = new();

}
public class UpdateGoodsReceiveItemDetailDto
{
    public string GoodsReceiveItemId { get; init; } = string.Empty;
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    //public string? SerialNo { get; init; }
    public string? ServiceNo { get; init; }
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
    public string? DefaultWarehouseId { get; init; }
    public double? FreightCharges { get; init; } = 0;
    public double? OtherCharges { get; init; } = 0;
    public List<UpdateGoodsReceiveItemDto> Items { get; init; } = new();
}

//public class UpdateGoodsReceiveValidator : AbstractValidator<UpdateGoodsReceiveRequest>
//{
//    public UpdateGoodsReceiveValidator()
//    {
//        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required.");
//        RuleForEach(x => x.Items).ChildRules(childValidator =>
//        {
//            childValidator.RuleFor(item => item.PurchaseOrderItemId).NotEmpty().WithMessage("Purchase Order Item ID is required.");
//            childValidator.RuleFor(item => item.ReceivedQuantity)
//                .GreaterThanOrEqualTo(0).WithMessage("Received quantity must be >= 0.");
//        });
//    }
//}
public class UpdateGoodsReceiveValidator : AbstractValidator<UpdateGoodsReceiveRequest>
{
    //private readonly ICommandRepository<Product> _productRepository;

    public UpdateGoodsReceiveValidator()//ICommandRepository<Product> productRepository
    {
        //_productRepository = productRepository;

        RuleFor(x => x.ReceiveDate).NotEmpty().WithMessage("Receive date is required.");
        RuleFor(x => x.Status).NotEmpty().WithMessage("Status is required.");
        RuleFor(x => x.PurchaseOrderId).NotEmpty().WithMessage("Purchase Order ID is required.");
       
        RuleFor(x => x.Items).NotEmpty().WithMessage("At least one item must be provided for receipt.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.PurchaseOrderItemId).NotEmpty();
            item.RuleFor(i => i.ReceivedQuantity)
                .GreaterThan(0).WithMessage("Received quantity must be greater than 0.");
            item.RuleFor(i => i.MRP)
                .NotNull().GreaterThan(0).WithMessage("MRP must be provided and greater than 0 for each item.");

           
        });
    }

}
public class UpdateGoodsReceiveHandler
    : IRequestHandler<UpdateGoodsReceiveRequest, UpdateGoodsReceiveResult>
{
    private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepo;
    private readonly ICommandRepository<GoodsReceiveItem> _itemRepo;
    private readonly ICommandRepository<GoodsReceiveItemDetails> _detailRepo;
    private readonly ICommandRepository<PurchaseOrderItem> _poItemRepo;
    private readonly ICommandRepository<PurchaseOrder> _poRepo;
    private readonly ICommandRepository<ProductPriceDefinition> _priceRepo;
    private readonly ICommandRepository<Product> _productRepo;
    private readonly ICommandRepository<InventoryTransaction> _invTxRepo;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _invAttrRepo;
    private readonly ICommandRepository<Warehouse> _warehouseRepo;

    private readonly InventoryTransactionService _invService;
    private readonly ISecurityService _security;
    private readonly IQueryContext _query;
    private readonly IUnitOfWork _uow;

    public UpdateGoodsReceiveHandler(
        ICommandRepository<GoodsReceive> goodsReceiveRepo,
        ICommandRepository<GoodsReceiveItem> itemRepo,
        ICommandRepository<GoodsReceiveItemDetails> detailRepo,
        ICommandRepository<PurchaseOrderItem> poItemRepo,
        ICommandRepository<PurchaseOrder> poRepo,
        ICommandRepository<ProductPriceDefinition> priceRepo,
        ICommandRepository<Product> productRepo,
        ICommandRepository<InventoryTransaction> invTxRepo,
        ICommandRepository<InventoryTransactionAttributesDetails> invAttrRepo,
        ICommandRepository<Warehouse> warehouseRepo,
        InventoryTransactionService invService,
        ISecurityService security,
        IQueryContext query,
        IUnitOfWork uow)
    {
        _goodsReceiveRepo = goodsReceiveRepo;
        _itemRepo = itemRepo;
        _detailRepo = detailRepo;
        _poItemRepo = poItemRepo;
        _poRepo = poRepo;
        _priceRepo = priceRepo;
        _productRepo = productRepo;
        _invTxRepo = invTxRepo;
        _invAttrRepo = invAttrRepo;
        _warehouseRepo = warehouseRepo;

        _invService = invService;
        _security = security;
        _query = query;
        _uow = uow;
    }

    public async Task<UpdateGoodsReceiveResult> Handle(UpdateGoodsReceiveRequest req, CancellationToken ct)
    {
        // --------------------------------------------------------------
        // 1️⃣ Load GR + all related items/products
        // --------------------------------------------------------------
        var gr = await _goodsReceiveRepo.GetQuery()
            .Include(x => x.GoodsReceiveItems)
                .ThenInclude(i => i.PurchaseOrderItem)
                    .ThenInclude(po => po.Product)
            .FirstOrDefaultAsync(x => x.Id == req.Id, ct)
            ?? throw new Exception($"Goods Receive not found: {req.Id}");

        var oldStatus = gr.Status;

        // --------------------------------------------------------------
        // 2️⃣ Parse Status
        // --------------------------------------------------------------
        if (!Enum.TryParse<GoodsReceiveStatus>(req.Status, out var newStatus))
            throw new InvalidOperationException($"Invalid status: {req.Status}");

        // --------------------------------------------------------------
        // 3️⃣ Load PO (must be tracked)
        // --------------------------------------------------------------
        var po = await _poRepo.GetQuery()
            .Include(x => x.PurchaseOrderItemList)
            .FirstOrDefaultAsync(x => x.Id == gr.PurchaseOrderId, ct)
            ?? throw new Exception($"PO not found: {gr.PurchaseOrderId}");

        var poById = po.PurchaseOrderItemList.ToDictionary(x => x.Id);

        // --------------------------------------------------------------
        // 4️⃣ Validate Warehouse (only if Approved)
        // --------------------------------------------------------------
        Warehouse? defaultWarehouse = null;

        if (newStatus == GoodsReceiveStatus.Approved)
        {
            if (string.IsNullOrEmpty(req.DefaultWarehouseId))
                throw new InvalidOperationException("Default warehouse is required for Approved status.");

            defaultWarehouse = await _warehouseRepo.GetQuery()
                .ApplyIsDeletedFilter(false)
                .FirstOrDefaultAsync(x => x.Id == req.DefaultWarehouseId, ct)
                ?? throw new InvalidOperationException($"Warehouse not found: {req.DefaultWarehouseId}");
        }

        // --------------------------------------------------------------
        // 5️⃣ Update GR header
        // --------------------------------------------------------------
        gr.ReceiveDate = _security.ConvertToIst(req.ReceiveDate) ?? gr.ReceiveDate;
        gr.Description = req.Description ?? gr.Description;
        gr.FreightCharges = req.FreightCharges ?? 0;
        gr.OtherCharges = req.OtherCharges ?? 0;
        gr.Status = newStatus;
        gr.UpdatedById = req.UpdatedById;
        gr.UpdatedAtUtc = DateTime.UtcNow;

        _goodsReceiveRepo.Update(gr);

        // --------------------------------------------------------------
        // 6️⃣ Per unit calculation
        // --------------------------------------------------------------
        double totalQty = req.Items.Sum(x => x.ReceivedQuantity);
        double freightPerUnit = totalQty == 0 ? 0 : (req.FreightCharges ?? 0) / totalQty;
        double otherPerUnit = totalQty == 0 ? 0 : (req.OtherCharges ?? 0) / totalQty;

        // --------------------------------------------------------------
        // 7️⃣ Sync items (Add / Update / Delete)
        // --------------------------------------------------------------
        var existingItems = gr.GoodsReceiveItems.ToDictionary(x => x.Id);
        var incomingItemIds = req.Items.Where(i => i.Id != null).Select(i => i.Id).ToHashSet();

        // DELETE removed items
        foreach (var old in existingItems.Values.Where(x => !incomingItemIds.Contains(x.Id)).ToList())
            _itemRepo.Delete(old);

        // Map for storing detail IDs for inventoryTx later
        var detailMap = new Dictionary<string, List<GoodsReceiveItemDetails>>();

        // Process each incoming item
        foreach (var dto in req.Items)
        {
            if (!poById.TryGetValue(dto.PurchaseOrderItemId, out var poItem))
                throw new Exception($"PO Item not found: {dto.PurchaseOrderItemId}");

            GoodsReceiveItem item;

            // UPDATE
            if (!string.IsNullOrWhiteSpace(dto.Id) && existingItems.TryGetValue(dto.Id, out var exist))
            {
                exist.ReceivedQuantity = dto.ReceivedQuantity;
                exist.UnitPrice = dto.UnitPrice ?? 0;
                exist.TaxAmount = dto.TaxAmount ?? 0;
                exist.FreightChargesPerUnit = freightPerUnit;
                exist.OtherChargesPerUnit = otherPerUnit;
                exist.FinalUnitPrice = (dto.UnitPrice ?? 0) + (dto.TaxAmount ?? 0) + freightPerUnit + otherPerUnit;
                exist.MRP = dto.MRP ?? 0;
                exist.Notes = dto.Notes;
                exist.Attribute1DetailId = dto.Attribute1DetailId;
                exist.Attribute2DetailId = dto.Attribute2DetailId;
                exist.UpdatedById = req.UpdatedById;
                exist.UpdatedAtUtc = DateTime.UtcNow;

                _itemRepo.Update(exist);
                item = exist;
            }
            else
            {
                // CREATE
                item = new GoodsReceiveItem
                {
                    GoodsReceiveId = gr.Id,
                    PurchaseOrderItemId = dto.PurchaseOrderItemId,
                    ReceivedQuantity = dto.ReceivedQuantity,
                    UnitPrice = dto.UnitPrice ?? 0,
                    TaxAmount = dto.TaxAmount ?? 0,
                    FreightChargesPerUnit = freightPerUnit,
                    OtherChargesPerUnit = otherPerUnit,
                    FinalUnitPrice = (dto.UnitPrice ?? 0) + (dto.TaxAmount ?? 0) + freightPerUnit + otherPerUnit,
                    MRP = dto.MRP ?? 0,
                    Notes = dto.Notes,
                    Attribute1DetailId = dto.Attribute1DetailId,
                    Attribute2DetailId = dto.Attribute2DetailId,
                    CreatedById = gr.CreatedById,
                    CreatedAtUtc = DateTime.UtcNow
                };

                await _itemRepo.CreateAsync(item, ct);
            }

            // --------------------------------------------------------------
            // Update PO received quantity
            // --------------------------------------------------------------
            poItem.ReceivedQuantity += dto.ReceivedQuantity;
            _poItemRepo.Update(poItem);

            // --------------------------------------------------------------
            // Replace all details for this item
            // --------------------------------------------------------------
            var oldDetails = await _detailRepo.GetQuery()
                .Where(d => d.GoodsReceiveItemId == item.Id)
                .ToListAsync(ct);

            foreach (var d in oldDetails)
                _detailRepo.Delete(d);

            var newDetailList = new List<GoodsReceiveItemDetails>();

            foreach (var d in dto.Attributes)
            {
                var nd = new GoodsReceiveItemDetails
                {
                    GoodsReceiveItemId = item.Id,
                    RowIndex = d.RowIndex,
                    IMEI1 = d.IMEI1,
                    IMEI2 = d.IMEI2,
                    ServiceNo = d.ServiceNo,
                    CreatedById = req.UpdatedById,
                    CreatedAtUtc = DateTime.UtcNow
                };

                await _detailRepo.CreateAsync(nd, ct);
                newDetailList.Add(nd);
            }

            detailMap[item.Id] = newDetailList;

            // --------------------------------------------------------------
            // PRICE DEFINITION LOGIC (Weighted Average)
            // --------------------------------------------------------------
            var productId = poItem.ProductId;
            double newUnitPrice = dto.UnitPrice ?? item.UnitPrice;

            var existingPrice = await _priceRepo.GetQuery()
                .Where(p => p.ProductId == productId && p.IsActive && !p.IsDeleted)
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            // No price → create one
            if (existingPrice == null)
            {
                var firstPrice = new ProductPriceDefinition
                {
                    ProductId = productId,
                    ProductName = poItem.Product?.Name,
                    CostPrice = Convert.ToDecimal(newUnitPrice),
                    EffectiveFrom = _security.ConvertToIst(DateTime.UtcNow),
                    IsActive = true
                };

                await _priceRepo.CreateAsync(firstPrice, ct);
                await _uow.SaveAsync(ct);
            }
            else
            {
                double oldPrice = Convert.ToDouble(existingPrice.CostPrice);

                if (Math.Round(oldPrice, 2) != Math.Round(newUnitPrice, 2))
                {
                    var stockResult = await _query.InventoryTransaction
                        .AsNoTracking()
                        .ApplyIsDeletedFilter(false)
                        .Where(x => x.Status == InventoryTransactionStatus.Confirmed &&
                                    x.WarehouseId == req.DefaultWarehouseId &&
                                    x.ProductId == productId)
                        .GroupBy(x => x.ProductId)
                        .Select(g => new
                        {
                            ProductId = g.Key,
                            TotalStock = (double)(g.Sum(x => x.Stock) ?? 0)
                        })
                        .FirstOrDefaultAsync(ct);

                    double stockQty = stockResult?.TotalStock ?? 0;

                    double existingValue = stockQty * oldPrice;
                    double receivedValue = item.ReceivedQuantity * newUnitPrice;

                    double weightedAvg =
                        (stockQty + item.ReceivedQuantity) == 0
                        ? newUnitPrice
                        : (existingValue + receivedValue) / (stockQty + item.ReceivedQuantity);

                    weightedAvg = Math.Round(weightedAvg, 2);

                    existingPrice.IsActive = false;
                    existingPrice.EffectiveTo = _security.ConvertToIst(DateTime.UtcNow);
                    _priceRepo.Update(existingPrice);

                    var newPrice = new ProductPriceDefinition
                    {
                        ProductId = productId,
                        ProductName = existingPrice.ProductName,
                        CostPrice = Convert.ToDecimal(weightedAvg),
                        EffectiveFrom = _security.ConvertToIst(DateTime.UtcNow),
                        IsActive = true,
                        MarginPercentage = existingPrice.MarginPercentage,
                        CurrencyCode = existingPrice.CurrencyCode
                    };

                    await _priceRepo.CreateAsync(newPrice, ct);
                    await _uow.SaveAsync(ct);
                }
            }
        }

        // --------------------------------------------------------------
        // 8️⃣ Save GR + Items + Details
        // --------------------------------------------------------------
        await _uow.SaveAsync(ct);

        // --------------------------------------------------------------
        // 9️⃣ Delete Old InventoryTx ONLY AFTER SUCCESSFUL GR UPDATE
        // --------------------------------------------------------------
        if (oldStatus == GoodsReceiveStatus.Approved)
        {
            var oldTx = await _invTxRepo.GetQuery()
                .Where(tx => tx.ModuleId == gr.Id)
                .ToListAsync(ct);

            foreach (var tx in oldTx)
                _invTxRepo.Delete(tx);

            await _uow.SaveAsync(ct);
        }

        // --------------------------------------------------------------
        // 🔟 Re-create new inventory transactions (if Approved)
        // --------------------------------------------------------------
        if (newStatus == GoodsReceiveStatus.Approved)
        {
            foreach (var item in gr.GoodsReceiveItems)
            {
                var poItem = poById[item.PurchaseOrderItemId];

                if (poItem.Product?.Physical != true)
                    continue;

                var inventoryTx = await _invService.GoodsReceiveCreateInvenTrans(
                    gr.Id,
                    req.DefaultWarehouseId,
                    poItem.ProductId,
                    item.ReceivedQuantity,
                    req.UpdatedById,
                    ct);

                if (inventoryTx != null &&
                    detailMap.TryGetValue(item.Id, out var details))
                {
                    foreach (var det in details)
                    {
                        var map = new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTx.Id,
                            GoodsReceiveItemDetailsId = det.Id,
                            CreatedById = req.UpdatedById,
                            CreatedAtUtc = DateTime.UtcNow
                        };

                        await _invAttrRepo.CreateAsync(map, ct);
                    }
                }
            }

            await _uow.SaveAsync(ct);
        }

        return new UpdateGoodsReceiveResult { Data = gr };
    }
}


//public class UpdateGoodsReceiveHandler : IRequestHandler<UpdateGoodsReceiveRequest, UpdateGoodsReceiveResult>
//{
//    private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;
//    private readonly ICommandRepository<GoodsReceiveItem> _goodsReceiveItemRepository;
//    private readonly ICommandRepository<GoodsReceiveItemDetails> _goodsReceiveItemDetailsRepository;
//    private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
//    private readonly ICommandRepository<Warehouse> _warehouseRepository;
//    private readonly ICommandRepository<InventoryTransaction> _inventoryTransactionRepository;
//    private readonly ICommandRepository<ProductPriceDefinition> _productpriceDefRepository;
//    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _inventoryTransactionAttributesDetailsRepository;
//    private readonly ICommandRepository<Product> _productRepository;

//    private readonly IUnitOfWork _unitOfWork;
//    private readonly InventoryTransactionService _inventoryTransactionService;
//    private readonly ISecurityService _securityService;
//    private readonly IQueryContext _queryContext;
//    public UpdateGoodsReceiveHandler(
//        ICommandRepository<GoodsReceive> goodsReceiveRepository,
//        ICommandRepository<GoodsReceiveItem> goodsReceiveItemRepository,
//        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository,
//        ICommandRepository<PurchaseOrder> purchaseOrderRepository,
//        ICommandRepository<Warehouse> warehouseRepository,
//        ICommandRepository<InventoryTransaction> inventoryTransactionRepository,
//        ICommandRepository<ProductPriceDefinition> productpricedefinitionrepository,
//        ICommandRepository<InventoryTransactionAttributesDetails> inventoryTransactionAttributesDetailsRepository,
//        ICommandRepository<Product> productRepository,

//        IUnitOfWork unitOfWork,
//        InventoryTransactionService inventoryTransactionService,
//        ISecurityService securityService,
//        IQueryContext queryContext)
//    {
//        _goodsReceiveRepository = goodsReceiveRepository;
//        _goodsReceiveItemRepository = goodsReceiveItemRepository;
//        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
//        _purchaseOrderRepository = purchaseOrderRepository;
//        _warehouseRepository = warehouseRepository;
//        _inventoryTransactionRepository = inventoryTransactionRepository;
//        _productpriceDefRepository = productpricedefinitionrepository;
//        _inventoryTransactionAttributesDetailsRepository = inventoryTransactionAttributesDetailsRepository;
//        _productRepository = productRepository;
//        _unitOfWork = unitOfWork;
//        _inventoryTransactionService = inventoryTransactionService;
//        _securityService = securityService;
//        _queryContext = queryContext;
//    }

//    public async Task<UpdateGoodsReceiveResult> Handle(UpdateGoodsReceiveRequest request, CancellationToken cancellationToken)
//    {
//        // ✅ Step 1: Load GR and related items
//        var entity = await _goodsReceiveRepository.GetQuery()
//            .ApplyIsDeletedFilter(false)
//            .Include(x => x.GoodsReceiveItems)
//                .ThenInclude(i => i.PurchaseOrderItem)
//                    .ThenInclude(po => po.Product)
//            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken)
//            ?? throw new Exception($"Goods Receive not found: {request.Id}");

//        var oldStatus = entity.Status;

//        // ✅ Step 2: Parse and validate
//        if (!Enum.TryParse<GoodsReceiveStatus>(request.Status, out var receiveStatus))
//            throw new InvalidOperationException($"Invalid status: {request.Status}");

//        Warehouse? defaultWarehouse = null;
//        if (!string.IsNullOrEmpty(request.DefaultWarehouseId))
//        {
//            defaultWarehouse = await _warehouseRepository.GetQuery()
//                .ApplyIsDeletedFilter(false)
//                .FirstOrDefaultAsync(x => x.Id == request.DefaultWarehouseId, cancellationToken)
//                ?? throw new InvalidOperationException($"Warehouse '{request.DefaultWarehouseId}' not found.");
//        }

//        // ✅ Step 3: Load Purchase Order (tracked)
//        var po = await _purchaseOrderRepository.GetQuery()
//            .ApplyIsDeletedFilter(false)
//            .Include(x => x.PurchaseOrderItemList)
//            .FirstOrDefaultAsync(x => x.Id == entity.PurchaseOrderId, cancellationToken)
//            ?? throw new InvalidOperationException($"Purchase Order '{entity.PurchaseOrderId}' not found.");

//        var poItemsById = po.PurchaseOrderItemList.ToDictionary(x => x.Id);

//        // ✅ Step 4: Remove old inventory transactions if old status was Approved
//        if (oldStatus == GoodsReceiveStatus.Approved)
//        {
//            var oldTx = await _inventoryTransactionRepository.GetQuery()
//                .Where(tx => tx.ModuleId == entity.Id)
//                .ToListAsync(cancellationToken);

//            foreach (var tx in oldTx)
//                _inventoryTransactionRepository.Delete(tx);
//        }

//        // ✅ Step 5: Update GR header
//        entity.ReceiveDate = _securityService.ConvertToIst(request.ReceiveDate ?? entity.ReceiveDate);
//        entity.Description = request.Description ?? entity.Description;
//        entity.UpdatedById = request.UpdatedById!;
//        entity.UpdatedAtUtc = DateTime.UtcNow;
//        entity.Status = receiveStatus;
//        entity.FreightCharges = request.FreightCharges ?? 0;
//        entity.OtherCharges = request.OtherCharges ?? 0;
//        _goodsReceiveRepository.Update(entity);

//        // ✅ Step 6: Per-unit freight/other allocation
//        double totalReceivedQty = request.Items.Sum(i => i.ReceivedQuantity);
//        double freightPerUnit = totalReceivedQty > 0 ? (request.FreightCharges ?? 0) / totalReceivedQty : 0;
//        double otherPerUnit = totalReceivedQty > 0 ? (request.OtherCharges ?? 0) / totalReceivedQty : 0;

//        // ✅ Step 7: Sync items (update, add, delete safely)
//        var existingItems = entity.GoodsReceiveItems.ToDictionary(x => x.Id, x => x);
//        var requestItemIds = request.Items.Where(i => !string.IsNullOrEmpty(i.Id)).Select(i => i.Id!).ToHashSet();

//        // Remove deleted items
//        foreach (var oldItem in entity.GoodsReceiveItems.Where(i => !requestItemIds.Contains(i.Id)).ToList())
//        {
//            entity.GoodsReceiveItems.Remove(oldItem);
//            _goodsReceiveItemRepository.Delete(oldItem);
//        }
//        var itemToDetailMap = new Dictionary<string, List<GoodsReceiveItemDetails>>();

//        // Update or Add
//        foreach (var dto in request.Items.Where(i => i.ReceivedQuantity > 0))
//        {
//            if (!poItemsById.TryGetValue(dto.PurchaseOrderItemId, out var poItem))
//                throw new InvalidOperationException($"PO Item '{dto.PurchaseOrderItemId}' not found.");
//            GoodsReceiveItem currentItem;
//            if (dto.Id != null && existingItems.TryGetValue(dto.Id, out var existing))
//            {
//                // ✅ Update existing
//                existing.ReceivedQuantity = dto.ReceivedQuantity;
//                existing.UnitPrice = dto.UnitPrice ?? 0;
//                existing.TaxAmount = dto.TaxAmount ?? 0;
//                existing.FreightChargesPerUnit = Math.Round(freightPerUnit, 2);
//                existing.OtherChargesPerUnit = Math.Round(otherPerUnit, 2);
//                existing.FinalUnitPrice = Math.Round((dto.UnitPrice ?? 0) + (dto.TaxAmount ?? 0) + freightPerUnit + otherPerUnit, 2);
//                existing.MRP = dto.MRP ?? 0;
//                existing.Notes = dto.Notes;
//                existing.UpdatedById = request.UpdatedById;
//                existing.UpdatedAtUtc = DateTime.Now;
//                existing.Attribute1DetailId = dto.Attribute1DetailId;
//                existing.Attribute2DetailId = dto.Attribute2DetailId;

//                currentItem = existing;
//            }
//            else
//            {
//                // ✅ Add new
//                var newItem = new GoodsReceiveItem
//                {
//                    GoodsReceiveId = entity.Id,
//                    PurchaseOrderItemId = dto.PurchaseOrderItemId,
//                    ReceivedQuantity = dto.ReceivedQuantity,
//                    UnitPrice = dto.UnitPrice ?? 0,
//                    TaxAmount = dto.TaxAmount ?? 0,
//                    FreightChargesPerUnit = Math.Round(freightPerUnit, 2),
//                    OtherChargesPerUnit = Math.Round(otherPerUnit, 2),
//                    FinalUnitPrice = Math.Round((dto.UnitPrice ?? 0) + (dto.TaxAmount ?? 0) + freightPerUnit + otherPerUnit, 2),
//                    MRP = dto.MRP ?? 0,
//                    Notes = dto.Notes,
//                    CreatedById = entity.CreatedById,
//                    CreatedAtUtc = DateTime.Now,
//                    IsDeleted = false,
//                    Attribute1DetailId = dto.Attribute1DetailId,
//                    Attribute2DetailId = dto.Attribute2DetailId

//                };
//                entity.GoodsReceiveItems.Add(newItem);
//                await _goodsReceiveItemRepository.CreateAsync(newItem, cancellationToken);
//                currentItem = newItem;
//            }

//            poItem.ReceivedQuantity += dto.ReceivedQuantity;

//            // =========================================
//            // ATTRIBUTE UPDATE (IMEI / Serial / Service)
//            // =========================================

//            // 1️⃣ Delete old records for this item id
//            var oldDetails = await _goodsReceiveItemDetailsRepository.GetQuery()
//                .Where(d => d.GoodsReceiveItemId == currentItem.Id)
//                .ToListAsync(cancellationToken);

//            foreach (var od in oldDetails)
//                _goodsReceiveItemDetailsRepository.Delete(od);

//            // ------------------------------
//            // INSERT NEW DETAILS + CAPTURE IDs
//            // ------------------------------
//            List<GoodsReceiveItemDetails> newDetails = new();
//            var product = await _productRepository.GetQuery()
//                .FirstOrDefaultAsync(x => x.Id == poItem.ProductId, cancellationToken);
//            if (product == null)
//            {
//                throw new InvalidOperationException("Product not found.");
//            }



//            foreach (var d in dto.Attributes)
//            {
//                if (product.ServiceNo && string.IsNullOrWhiteSpace(d.ServiceNo))
//                    throw new InvalidOperationException("Service No is required.");

//                if (product.Imei1 && string.IsNullOrWhiteSpace(d.IMEI1))
//                    throw new InvalidOperationException("IMEI1 is required.");
//                if (product.Imei1 && !Regex.IsMatch(d.IMEI1, @"^\d{15}$"))
//                    throw new InvalidOperationException("IMEI1 must be 15 digits.");

//                if (product.Imei2 && string.IsNullOrWhiteSpace(d.IMEI2))
//                    throw new InvalidOperationException("IMEI2 is required.");
//                if (product.Imei2 && !Regex.IsMatch(d.IMEI2, @"^\d{15}$"))
//                    throw new InvalidOperationException("IMEI2 must be 15 digits.");

//                var detail = new GoodsReceiveItemDetails
//                {

//                    GoodsReceiveItemId = currentItem.Id,
//                    RowIndex = d.RowIndex,
//                    IMEI1 = d.IMEI1,
//                    IMEI2 = d.IMEI2,
//                    ServiceNo = d.ServiceNo,
//                    UpdatedById = request.UpdatedById,
//                    UpdatedAtUtc = DateTime.UtcNow
//                };

//                await _goodsReceiveItemDetailsRepository.CreateAsync(detail, cancellationToken);

//                // ⭐ capture inserted detail (with ID)
//                newDetails.Add(detail);
//            }

//            // ⭐ Store all new detail IDs into dictionary for later use
//            itemToDetailMap[currentItem.Id] = newDetails;


//            // ---------------------------------------------------------
//            // PRICE DEFINITION UPDATE LOGIC
//            // ---------------------------------------------------------

//            var productId = poItem.ProductId;
//            double newUnitPrice = dto.UnitPrice ?? currentItem.UnitPrice;


//            var existingPrice = await _productpriceDefRepository.GetQuery()
//            .Where(p => p.ProductId == productId && p.IsActive && !p.IsDeleted)
//            .OrderByDescending(p => p.EffectiveFrom)
//            .FirstOrDefaultAsync(cancellationToken);
//            // If NO price exists — create first one
//            if (existingPrice == null)
//            {
//                var newPrice = new ProductPriceDefinition
//                {
//                    ProductId = productId,
//                    ProductName = poItem.Product?.Name,
//                    CostPrice = Convert.ToDecimal(newUnitPrice),
//                    EffectiveFrom = _securityService.ConvertToIst(DateTime.UtcNow),
//                    IsActive = true
//                };


//                await _productpriceDefRepository.CreateAsync(newPrice, cancellationToken);
//                await _unitOfWork.SaveAsync(cancellationToken);
//                continue;
//            }


//            double oldPrice = Convert.ToDouble(existingPrice.CostPrice);


//            // Skip if same price
//            if (Math.Round(oldPrice, 2) == Math.Round(newUnitPrice, 2))
//                continue;


//            // FETCH STOCK
//            var stockResult = await _queryContext.InventoryTransaction
//            .AsNoTracking()
//            .ApplyIsDeletedFilter(false)
//            .Where(x => x.Status == InventoryTransactionStatus.Confirmed &&
//            x.WarehouseId == request.DefaultWarehouseId &&
//            x.ProductId == productId)
//            .GroupBy(x => x.ProductId)
//            .Select(g => new
//            {
//                ProductId = g.Key,
//                TotalStock = (double)(g.Sum(x => x.Stock) ?? 0)
//            })
//            .FirstOrDefaultAsync(cancellationToken);


//            double stockQty = stockResult?.TotalStock ?? 0;


//            // WEIGHTED AVERAGE
//            double existingValue = stockQty * oldPrice;
//            double receivedValue = dto.ReceivedQuantity * newUnitPrice;
//            double weightedAvg = (existingValue + receivedValue) / (stockQty + dto.ReceivedQuantity);
//            weightedAvg = Math.Round(weightedAvg, 2);


//            // DEACTIVATE OLD
//            existingPrice.IsActive = false;
//            existingPrice.EffectiveTo = _securityService.ConvertToIst(DateTime.UtcNow);
//            _productpriceDefRepository.Update(existingPrice);


//            // CREATE NEW PRICE
//            var newPriceDef = new ProductPriceDefinition
//            {
//                ProductId = productId,
//                ProductName = existingPrice.ProductName,
//                CostPrice = Convert.ToDecimal(weightedAvg),
//                EffectiveFrom = _securityService.ConvertToIst(DateTime.UtcNow),
//                IsActive = true,
//                MarginPercentage = existingPrice.MarginPercentage,
//                CurrencyCode = existingPrice.CurrencyCode
//            };


//            await _productpriceDefRepository.CreateAsync(newPriceDef, cancellationToken);
//            await _unitOfWork.SaveAsync(cancellationToken);
//        }


//        // UPDATE PO
//        po.OrderDate = _securityService.ConvertToIst(po.OrderDate);
//        _purchaseOrderRepository.Update(po);
//        await _unitOfWork.SaveAsync(cancellationToken);


//        // ✅ Step 8: Recreate inventory transactions if Approved
//        if (receiveStatus == GoodsReceiveStatus.Approved)
//        {
//            if (string.IsNullOrEmpty(request.DefaultWarehouseId))
//                throw new InvalidOperationException("Default warehouse required for Approved status.");

//            foreach (var item in entity.GoodsReceiveItems)
//            {
//                var poItem = poItemsById[item.PurchaseOrderItemId];
//                if (poItem.Product?.Physical != true)
//                    continue;

//                var inventoryTx = await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
//                                    entity.Id,
//                                    request.DefaultWarehouseId,
//                                    poItem.ProductId,
//                                    item.ReceivedQuantity,
//                                    request.UpdatedById!,
//                                    cancellationToken);

//                // ⭐ After inventory transaction is created → insert detail FK rows
//                if (inventoryTx != null)
//                {
//                    // Get newly created GoodsReceiveItemDetails for this item
//                    if (itemToDetailMap.TryGetValue(item.Id, out var details))
//                    {
//                        foreach (var det in details)
//                        {
//                            var invDetail = new InventoryTransactionAttributesDetails
//                            {
//                                InventoryTransactionId = inventoryTx.Id,  // FK
//                                GoodsReceiveItemDetailsId = det.Id,       // FK
//                                UpdatedById = request.UpdatedById,
//                                UpdatedAtUtc = DateTime.UtcNow
//                            };

//                            await _inventoryTransactionAttributesDetailsRepository.CreateAsync(invDetail, cancellationToken);
//                        }
//                    }
//                }

//                //await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
//                //    entity.Id,
//                //    request.DefaultWarehouseId,
//                //    poItem.ProductId,
//                //    item.ReceivedQuantity,
//                //    request.UpdatedById!,
//                //    cancellationToken);
//            }
//        }

//        // ✅ Step 9: Final save and propagate
//        await _unitOfWork.SaveAsync(cancellationToken);


//        return new UpdateGoodsReceiveResult { Data = entity };
//    }
////}
