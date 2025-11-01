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

namespace Application.Features.GoodsReceiveManager.Commands
{
    public class CreateGoodsReceiveItemDto
    {
        public string PurchaseOrderItemId { get; init; } = string.Empty;
        public double ReceivedQuantity { get; init; }
        public string? Notes { get; init; }
        public string? WarehouseId { get; init; } // Added warehouse ID
    }

    public class CreateGoodsReceiveResult
    {
        public GoodsReceive? Data { get; set; }
        public List<GoodsReceiveItem>? Items { get; set; } = new();
        public List<string>? CreatedInventoryTransactions { get; set; } = new(); // Track created inventory transactions
    }

    public class CreateGoodsReceiveRequest : IRequest<CreateGoodsReceiveResult>
    {
        public DateTime? ReceiveDate { get; init; }
        public string? Status { get; init; }
        public string? Description { get; init; }
        public string? PurchaseOrderId { get; init; }
        public string? CreatedById { get; init; }
        public List<CreateGoodsReceiveItemDto> Items { get; init; } = new();
        public string? DefaultWarehouseId { get; init; } // Default warehouse for all items
    }

    public class CreateGoodsReceiveValidator : AbstractValidator<CreateGoodsReceiveRequest>
    {
        public CreateGoodsReceiveValidator()
        {
            RuleFor(x => x.ReceiveDate).NotEmpty().WithMessage("Receive date is required.");
            RuleFor(x => x.Status).NotEmpty().WithMessage("Status is required.");
            RuleFor(x => x.PurchaseOrderId).NotEmpty().WithMessage("Purchase Order ID is required.");
            RuleFor(x => x.CreatedById).NotEmpty().WithMessage("Created By ID is required.");

            RuleFor(x => x.Items)
                .NotEmpty().WithMessage("At least one item must be provided for receipt.");

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.PurchaseOrderItemId).NotEmpty().WithMessage("Purchase Order Item ID is required.");
                item.RuleFor(i => i.ReceivedQuantity).GreaterThan(0).WithMessage("Received quantity must be greater than 0.");
            });
        }
    }

    public class CreateGoodsReceiveHandler : IRequestHandler<CreateGoodsReceiveRequest, CreateGoodsReceiveResult>
    {
        private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;
        private readonly ICommandRepository<GoodsReceiveItem> _goodsReceiveItemRepository;
        private readonly ICommandRepository<PurchaseOrderItem> _purchaseOrderItemRepository;
        private readonly ICommandRepository<PurchaseOrder> _purchaseOrderReadRepository;
        private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
        private readonly ICommandRepository<Warehouse> _warehouseRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly NumberSequenceService _numberSequenceService;
        private readonly InventoryTransactionService _inventoryTransactionService;
        private readonly ISecurityService _securityService;

        public CreateGoodsReceiveHandler(
            ICommandRepository<GoodsReceive> goodsReceiveRepository,
            ICommandRepository<GoodsReceiveItem> goodsReceiveItemRepository,
            ICommandRepository<PurchaseOrderItem> purchaseOrderItemRepository,
            ICommandRepository<PurchaseOrder> purchaseOrderReadRepository,
            ICommandRepository<PurchaseOrder> purchaseOrderRepository,
            ICommandRepository<Warehouse> warehouseRepository,
            IUnitOfWork unitOfWork,
            NumberSequenceService numberSequenceService,
            InventoryTransactionService inventoryTransactionService,
            ISecurityService securityService)
        {
            _goodsReceiveRepository = goodsReceiveRepository;
            _goodsReceiveItemRepository = goodsReceiveItemRepository;
            _purchaseOrderItemRepository = purchaseOrderItemRepository;
            _purchaseOrderReadRepository = purchaseOrderReadRepository;
            _purchaseOrderRepository = purchaseOrderRepository;
            _warehouseRepository = warehouseRepository;
            _unitOfWork = unitOfWork;
            _numberSequenceService = numberSequenceService;
            _inventoryTransactionService = inventoryTransactionService;
            _securityService = securityService;
        }

        public async Task<CreateGoodsReceiveResult> Handle(CreateGoodsReceiveRequest request, CancellationToken cancellationToken = default)
        {
            // Step 1: Load and validate Purchase Order with items
            var po = await _purchaseOrderReadRepository.GetQuery()
                .ApplyIsDeletedFilter(false)
                .Include(x => x.PurchaseOrderItemList)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(x => x.Id == request.PurchaseOrderId, cancellationToken);

            if (po == null)
                throw new InvalidOperationException($"Purchase Order '{request.PurchaseOrderId}' not found.");

            var poStatus = po.OrderStatus.GetValueOrDefault();
            if (poStatus == PurchaseOrderStatus.Cancelled ||
                poStatus == PurchaseOrderStatus.Pending)
                throw new InvalidOperationException($"Cannot create goods receive for a {poStatus} purchase order.");

            // Step 2: Parse incoming GoodsReceive status
            if (!Enum.TryParse<GoodsReceiveStatus>(request.Status, out var receiveStatus))
                throw new InvalidOperationException($"Invalid status: {request.Status}");

            // Step 3: Validate default warehouse if provided
            Warehouse? defaultWarehouse = null;
            if (!string.IsNullOrEmpty(request.DefaultWarehouseId))
            {
                defaultWarehouse = await _warehouseRepository.GetQuery()
                    .ApplyIsDeletedFilter(false)
                    .FirstOrDefaultAsync(x => x.Id == request.DefaultWarehouseId, cancellationToken);
                if (defaultWarehouse == null)
                    throw new InvalidOperationException($"Default warehouse '{request.DefaultWarehouseId}' not found.");
            }

            // Step 4: Create GoodsReceive header
            var goodsReceive = new GoodsReceive
            {
                Number = _numberSequenceService.GenerateNumber(nameof(GoodsReceive), "", "GR"),
                ReceiveDate = _securityService.ConvertToIst(request.ReceiveDate),
                Status = receiveStatus,
                Description = request.Description,
                PurchaseOrderId = request.PurchaseOrderId!,
                CreatedById = request.CreatedById!,
                CreatedAtUtc = DateTime.UtcNow,
                IsDeleted = false
            };

            await _goodsReceiveRepository.CreateAsync(goodsReceive, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);  // Save to generate Id

            // Step 5: Prepare PO items (reuse loaded tracked entities)
            var allPoItems = po.PurchaseOrderItemList;
            if (!allPoItems.Any())
                throw new InvalidOperationException($"No items found for Purchase Order '{request.PurchaseOrderId}'.");

            var requestedIds = request.Items
                .Select(i => i.PurchaseOrderItemId)
                .ToList();

            // Step 6: Process each received item (batched)
            var createdItems = new List<GoodsReceiveItem>();
            var createdInventoryTransactions = new List<string>();

            foreach (var reqItem in request.Items)
            {
                // Find PO item with case-insensitive trim match
                var poItem = allPoItems.FirstOrDefault(x =>
                    string.Equals(x.Id?.Trim(), reqItem.PurchaseOrderItemId?.Trim(), StringComparison.OrdinalIgnoreCase));

                if (poItem == null)
                {
                    var available = string.Join(", ", allPoItems.Select(x => x.Id));
                    throw new InvalidOperationException(
                        $"PurchaseOrderItem '{reqItem.PurchaseOrderItemId}' not found. Available IDs: [{available}]");
                }

                var remainingQty = (poItem.Quantity ?? 0) - poItem.ReceivedQuantity;
                if (reqItem.ReceivedQuantity > remainingQty)
                    throw new InvalidOperationException(
                        $"Cannot receive {reqItem.ReceivedQuantity} for item '{reqItem.PurchaseOrderItemId}'. Remaining: {remainingQty}.");

                if (reqItem.ReceivedQuantity <= 0)
                    continue;
                // ✅ Update PO item ReceivedQuantity in DB (tracked)
                poItem.ReceivedQuantity += reqItem.ReceivedQuantity;
                poItem.UpdatedById = request.CreatedById;
                _purchaseOrderItemRepository.Update(poItem);  // Ensure EF marks it as modified


                // Create GoodsReceiveItem
                var grItem = new GoodsReceiveItem
                {
                    GoodsReceiveId = goodsReceive.Id,
                    PurchaseOrderItemId = reqItem.PurchaseOrderItemId,
                    ReceivedQuantity = reqItem.ReceivedQuantity,
                    Notes = reqItem.Notes,
                    CreatedById = request.CreatedById!,
                    CreatedAtUtc = DateTime.UtcNow,
                    IsDeleted = false
                };
                await _goodsReceiveItemRepository.CreateAsync(grItem, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);  // Save to generate Id

                createdItems.Add(grItem);

                if (poItem.Product.Physical == true &&
                    receiveStatus != GoodsReceiveStatus.Draft &&
                    receiveStatus != GoodsReceiveStatus.Cancelled)
                {
                    var warehouseId = reqItem.WarehouseId ?? request.DefaultWarehouseId;

                    if (string.IsNullOrEmpty(warehouseId))
                        throw new InvalidOperationException($"Warehouse ID required for item '{reqItem.PurchaseOrderItemId}'.");

                    // Validate warehouse exists
                    var warehouse = await _warehouseRepository.GetQuery()
                        .ApplyIsDeletedFilter(false)
                        .FirstOrDefaultAsync(x => x.Id == warehouseId, cancellationToken);
                    if (warehouse == null)
                        throw new InvalidOperationException($"Warehouse '{warehouseId}' not found for item '{reqItem.PurchaseOrderItemId}'.");

                    var inventoryTx = await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
                        goodsReceive.Id,
                        warehouseId,
                        poItem.ProductId,
                        reqItem.ReceivedQuantity,
                        request.CreatedById,
                        cancellationToken);

                    if (inventoryTx != null)
                        createdInventoryTransactions.Add(inventoryTx.Id);
                }
            }

            // Step 7: Save all items and updated PO items
            await _unitOfWork.SaveAsync(cancellationToken);

            
            // Step 9: Final save for PO status if changed
            await _unitOfWork.SaveAsync(cancellationToken);

            return new CreateGoodsReceiveResult
            {
                Data = goodsReceive,
                Items = createdItems,
                CreatedInventoryTransactions = createdInventoryTransactions
            };
        }

        private async Task UpdatePurchaseOrderStatus(string purchaseOrderId, string updatedById, CancellationToken cancellationToken)
        {
            var po = await _purchaseOrderRepository.GetQuery()
                .ApplyIsDeletedFilter(false)
                .FirstOrDefaultAsync(x => x.Id == purchaseOrderId, cancellationToken);

            if (po == null) return;

            var allPoItems = await _purchaseOrderItemRepository.GetQuery()
                .ApplyIsDeletedFilter(false)
                .Where(x => x.PurchaseOrderId == purchaseOrderId)
                .ToListAsync(cancellationToken);

            bool isFullyReceived = allPoItems.All(item => item.ReceivedQuantity >= (item.Quantity ?? 0));
            bool isPartiallyReceived = allPoItems.Any(item => item.ReceivedQuantity > 0) && !isFullyReceived;

            var currentStatus = po.OrderStatus.GetValueOrDefault();
            var newStatus = currentStatus;

            
            if (newStatus != currentStatus)
            {
                po.OrderStatus = newStatus;
                po.UpdatedById = updatedById;
                po.UpdatedAtUtc = DateTime.UtcNow;
                _purchaseOrderRepository.Update(po);
            }
        }
    }
}