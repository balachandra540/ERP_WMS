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

//namespace Application.Features.GoodsReceiveManager.Commands
//{
//    public class CreateGoodsReceiveItemDto
//    {
//        public string PurchaseOrderItemId { get; init; } = string.Empty;
//        public double ReceivedQuantity { get; init; }
//        public string? Notes { get; init; }
//        public string? WarehouseId { get; init; } // Added warehouse ID
//    }

//    public class CreateGoodsReceiveResult
//    {
//        public GoodsReceive? Data { get; set; }
//        public List<GoodsReceiveItem>? Items { get; set; } = new();
//        public List<string>? CreatedInventoryTransactions { get; set; } = new(); // Track created inventory transactions
//    }

//    public class CreateGoodsReceiveRequest : IRequest<CreateGoodsReceiveResult>
//    {
//        public DateTime? ReceiveDate { get; init; }
//        public string? Status { get; init; }
//        public string? Description { get; init; }
//        public string? PurchaseOrderId { get; init; }
//        public string? CreatedById { get; init; }
//        public List<CreateGoodsReceiveItemDto> Items { get; init; } = new();
//        public string? DefaultWarehouseId { get; init; } // Default warehouse for all items
//    }

//    public class CreateGoodsReceiveValidator : AbstractValidator<CreateGoodsReceiveRequest>
//    {
//        public CreateGoodsReceiveValidator()
//        {
//            RuleFor(x => x.ReceiveDate).NotEmpty().WithMessage("Receive date is required.");
//            RuleFor(x => x.Status).NotEmpty().WithMessage("Status is required.");
//            RuleFor(x => x.PurchaseOrderId).NotEmpty().WithMessage("Purchase Order ID is required.");
//            RuleFor(x => x.CreatedById).NotEmpty().WithMessage("Created By ID is required.");

//            RuleFor(x => x.Items)
//                .NotEmpty().WithMessage("At least one item must be provided for receipt.");

//            RuleForEach(x => x.Items).ChildRules(item =>
//            {
//                item.RuleFor(i => i.PurchaseOrderItemId).NotEmpty().WithMessage("Purchase Order Item ID is required.");
//                item.RuleFor(i => i.ReceivedQuantity).GreaterThan(0).WithMessage("Received quantity must be greater than 0.");
//            });
//        }
//    }

//    public class CreateGoodsReceiveHandler : IRequestHandler<CreateGoodsReceiveRequest, CreateGoodsReceiveResult>
//    {
//        private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;
//        private readonly ICommandRepository<GoodsReceiveItem> _goodsReceiveItemRepository;
//        private readonly ICommandRepository<PurchaseOrderItem> _purchaseOrderItemRepository;
//        private readonly ICommandRepository<PurchaseOrder> _purchaseOrderReadRepository;
//        private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
//        private readonly ICommandRepository<Warehouse> _warehouseRepository;
//        private readonly IUnitOfWork _unitOfWork;
//        private readonly NumberSequenceService _numberSequenceService;
//        private readonly InventoryTransactionService _inventoryTransactionService;
//        private readonly ISecurityService _securityService;

//        public CreateGoodsReceiveHandler(
//            ICommandRepository<GoodsReceive> goodsReceiveRepository,
//            ICommandRepository<GoodsReceiveItem> goodsReceiveItemRepository,
//            ICommandRepository<PurchaseOrderItem> purchaseOrderItemRepository,
//            ICommandRepository<PurchaseOrder> purchaseOrderReadRepository,
//            ICommandRepository<PurchaseOrder> purchaseOrderRepository,
//            ICommandRepository<Warehouse> warehouseRepository,
//            IUnitOfWork unitOfWork,
//            NumberSequenceService numberSequenceService,
//            InventoryTransactionService inventoryTransactionService,
//            ISecurityService securityService)
//        {
//            _goodsReceiveRepository = goodsReceiveRepository;
//            _goodsReceiveItemRepository = goodsReceiveItemRepository;
//            _purchaseOrderItemRepository = purchaseOrderItemRepository;
//            _purchaseOrderReadRepository = purchaseOrderReadRepository;
//            _purchaseOrderRepository = purchaseOrderRepository;
//            _warehouseRepository = warehouseRepository;
//            _unitOfWork = unitOfWork;
//            _numberSequenceService = numberSequenceService;
//            _inventoryTransactionService = inventoryTransactionService;
//            _securityService = securityService;
//        }

//        public async Task<CreateGoodsReceiveResult> Handle(CreateGoodsReceiveRequest request, CancellationToken cancellationToken = default)
//        {
//            // Step 1: Load and validate Purchase Order with items
//            var po = await _purchaseOrderReadRepository.GetQuery()
//                .ApplyIsDeletedFilter(false)
//                .Include(x => x.PurchaseOrderItemList)
//                    .ThenInclude(i => i.Product)
//                .FirstOrDefaultAsync(x => x.Id == request.PurchaseOrderId, cancellationToken);

//            if (po == null)
//                throw new InvalidOperationException($"Purchase Order '{request.PurchaseOrderId}' not found.");

//            var poStatus = po.OrderStatus.GetValueOrDefault();
//            if (poStatus == PurchaseOrderStatus.Cancelled ||
//                poStatus == PurchaseOrderStatus.Pending)
//                throw new InvalidOperationException($"Cannot create goods receive for a {poStatus} purchase order.");

//            // Step 2: Parse incoming GoodsReceive status
//            if (!Enum.TryParse<GoodsReceiveStatus>(request.Status, out var receiveStatus))
//                throw new InvalidOperationException($"Invalid status: {request.Status}");

//            // Step 3: Validate default warehouse if provided
//            Warehouse? defaultWarehouse = null;
//            if (!string.IsNullOrEmpty(request.DefaultWarehouseId))
//            {
//                defaultWarehouse = await _warehouseRepository.GetQuery()
//                    .ApplyIsDeletedFilter(false)
//                    .FirstOrDefaultAsync(x => x.Id == request.DefaultWarehouseId, cancellationToken);
//                if (defaultWarehouse == null)
//                    throw new InvalidOperationException($"Default warehouse '{request.DefaultWarehouseId}' not found.");
//            }

//            // Step 4: Create GoodsReceive header
//            var goodsReceive = new GoodsReceive
//            {
//                Number = _numberSequenceService.GenerateNumber(nameof(GoodsReceive), "", "GR"),
//                ReceiveDate = _securityService.ConvertToIst(request.ReceiveDate),
//                Status = receiveStatus,
//                Description = request.Description,
//                PurchaseOrderId = request.PurchaseOrderId!,
//                CreatedById = request.CreatedById!,
//                CreatedAtUtc = DateTime.UtcNow,
//                IsDeleted = false
//            };

//            await _goodsReceiveRepository.CreateAsync(goodsReceive, cancellationToken);
//            await _unitOfWork.SaveAsync(cancellationToken);  // Save to generate Id

//            // Step 5: Prepare PO items (reuse loaded tracked entities)
//            var allPoItems = po.PurchaseOrderItemList;
//            if (!allPoItems.Any())
//                throw new InvalidOperationException($"No items found for Purchase Order '{request.PurchaseOrderId}'.");

//            var requestedIds = request.Items
//                .Select(i => i.PurchaseOrderItemId)
//                .ToList();

//            // Step 6: Process each received item (batched)
//            var createdItems = new List<GoodsReceiveItem>();
//            var createdInventoryTransactions = new List<string>();

//            foreach (var reqItem in request.Items)
//            {
//                // Find PO item with case-insensitive trim match
//                var poItem = allPoItems.FirstOrDefault(x =>
//                    string.Equals(x.Id?.Trim(), reqItem.PurchaseOrderItemId?.Trim(), StringComparison.OrdinalIgnoreCase));

//                if (poItem == null)
//                {
//                    var available = string.Join(", ", allPoItems.Select(x => x.Id));
//                    throw new InvalidOperationException(
//                        $"PurchaseOrderItem '{reqItem.PurchaseOrderItemId}' not found. Available IDs: [{available}]");
//                }

//                var remainingQty = (poItem.Quantity ?? 0) - poItem.ReceivedQuantity;
//                if (reqItem.ReceivedQuantity > remainingQty)
//                    throw new InvalidOperationException(
//                        $"Cannot receive {reqItem.ReceivedQuantity} for item '{reqItem.PurchaseOrderItemId}'. Remaining: {remainingQty}.");

//                if (reqItem.ReceivedQuantity <= 0)
//                    continue;
//                // ✅ Update PO item ReceivedQuantity in DB (tracked)
//                poItem.ReceivedQuantity += reqItem.ReceivedQuantity;
//                poItem.UpdatedById = request.CreatedById;
//                _purchaseOrderItemRepository.Update(poItem);  // Ensure EF marks it as modified


//                // Create GoodsReceiveItem
//                var grItem = new GoodsReceiveItem
//                {
//                    GoodsReceiveId = goodsReceive.Id,
//                    PurchaseOrderItemId = reqItem.PurchaseOrderItemId,
//                    ReceivedQuantity = reqItem.ReceivedQuantity,
//                    Notes = reqItem.Notes,
//                    CreatedById = request.CreatedById!,
//                    CreatedAtUtc = DateTime.UtcNow,
//                    IsDeleted = false
//                };
//                await _goodsReceiveItemRepository.CreateAsync(grItem, cancellationToken);
//                await _unitOfWork.SaveAsync(cancellationToken);  // Save to generate Id

//                createdItems.Add(grItem);

//                if (poItem.Product.Physical == true &&
//                    receiveStatus != GoodsReceiveStatus.Draft &&
//                    receiveStatus != GoodsReceiveStatus.Cancelled)
//                {
//                    var warehouseId = reqItem.WarehouseId ?? request.DefaultWarehouseId;

//                    if (string.IsNullOrEmpty(warehouseId))
//                        throw new InvalidOperationException($"Warehouse ID required for item '{reqItem.PurchaseOrderItemId}'.");

//                    // Validate warehouse exists
//                    var warehouse = await _warehouseRepository.GetQuery()
//                        .ApplyIsDeletedFilter(false)
//                        .FirstOrDefaultAsync(x => x.Id == warehouseId, cancellationToken);
//                    if (warehouse == null)
//                        throw new InvalidOperationException($"Warehouse '{warehouseId}' not found for item '{reqItem.PurchaseOrderItemId}'.");

//                    var inventoryTx = await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
//                        goodsReceive.Id,
//                        warehouseId,
//                        poItem.ProductId,
//                        reqItem.ReceivedQuantity,
//                        request.CreatedById,
//                        cancellationToken);

//                    if (inventoryTx != null)
//                        createdInventoryTransactions.Add(inventoryTx.Id);
//                }
//            }

//            // Step 7: Save all items and updated PO items
//            await _unitOfWork.SaveAsync(cancellationToken);


//            // Step 9: Final save for PO status if changed
//            await _unitOfWork.SaveAsync(cancellationToken);

//            return new CreateGoodsReceiveResult
//            {
//                Data = goodsReceive,
//                Items = createdItems,
//                CreatedInventoryTransactions = createdInventoryTransactions
//            };
//        }

//    }
//}

using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.InventoryTransactionManager.Queries;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Threading;

namespace Application.Features.GoodsReceiveManager.Commands
{
    public class CreateGoodsReceiveItemDto
    {
        public string PurchaseOrderItemId { get; init; } = string.Empty;
        public double ReceivedQuantity { get; init; }
        public double? UnitPrice { get; init; }
        public double? TaxAmount { get; init; }
        public double? FinalUnitPrice { get; init; }
        public double? MRP { get; init; }
        public string? Notes { get; init; }
        public string? WarehouseId { get; init; }
        public string? Attribute1DetailId { get; init; }
        public string? Attribute2DetailId { get; init; }

        public List<CreateGoodsReceiveItemDetailDto> Attributes { get; init; } = new();

    }
    public class CreateGoodsReceiveItemDetailDto
    {
        public string GoodsReceiveItemId { get; init; } = string.Empty;
        public int RowIndex { get; init; }
        public string? IMEI1 { get; init; }
        public string? IMEI2 { get; init; }
        //public string? SerialNo { get; init; }
        public string? ServiceNo { get; init; }
    }

    public class CreateGoodsReceiveResult
    {
        public GoodsReceive? Data { get; set; }
        public List<GoodsReceiveItem>? Items { get; set; } = new();
        public List<string>? CreatedInventoryTransactions { get; set; } = new();
        public List<ProductStockSummaryDto>? ProductStockQty { get; set; } = new();

    }

    public class CreateGoodsReceiveRequest : IRequest<CreateGoodsReceiveResult>
    {
        public DateTime? ReceiveDate { get; init; }
        public string? Status { get; init; }
        public string? Description { get; init; }
        public string? PurchaseOrderId { get; init; }
        public string? CreatedById { get; init; }
        public string? DefaultWarehouseId { get; init; }
        public double? FreightCharges { get; init; } = 0;
        public double? OtherCharges { get; init; } = 0;
        public List<CreateGoodsReceiveItemDto> Items { get; init; } = new();
    }

    public class CreateGoodsReceiveValidator : AbstractValidator<CreateGoodsReceiveRequest>
    {
        //private readonly ICommandRepository<Product> _productRepository;

        public CreateGoodsReceiveValidator()//ICommandRepository<Product> productRepository
        {
            //_productRepository = productRepository;

            RuleFor(x => x.ReceiveDate).NotEmpty().WithMessage("Receive date is required.");
            RuleFor(x => x.Status).NotEmpty().WithMessage("Status is required.");
            RuleFor(x => x.PurchaseOrderId).NotEmpty().WithMessage("Purchase Order ID is required.");
            RuleFor(x => x.CreatedById).NotEmpty().WithMessage("Created By ID is required.");
            RuleFor(x => x.Items).NotEmpty().WithMessage("At least one item must be provided for receipt.");

            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.PurchaseOrderItemId).NotEmpty();
                item.RuleFor(i => i.ReceivedQuantity)
                    .GreaterThan(0).WithMessage("Received quantity must be greater than 0.");
                
                // ⭐ Add backend validation for attributes
                //item.RuleFor(i => i).CustomAsync(ValidateAttributesAsync);
            });
        }

        //private async Task ValidateAttributesAsync(
        //    CreateGoodsReceiveItemDto item,
        //    ValidationContext<CreateGoodsReceiveItemDto> context,
        //    CancellationToken cancellationToken)
        //{
        //    // Load product
        //    var product = await _productRepository.GetQuery()
        //        .FirstOrDefaultAsync(x => x.Id == item.PurchaseOrderItemId, cancellationToken);
        //    if (product == null)
        //    {
        //        context.AddFailure("Product not found.");
        //        return;
        //    }

        //    foreach (var attr in item.Attributes)
        //    {
        //        // SERVICE NO
        //        if (product.ServiceNo)
        //        {
        //            if (string.IsNullOrWhiteSpace(attr.ServiceNo))
        //                context.AddFailure("Service No is required.");
        //        }

        //        // IMEI1
        //        if (product.Imei1)
        //        {
        //            if (string.IsNullOrWhiteSpace(attr.IMEI1))
        //                context.AddFailure("IMEI1 is required.");
        //            else if (!Regex.IsMatch(attr.IMEI1, @"^\d{15}$"))
        //                context.AddFailure("IMEI1 must be 15 digits.");
        //        }

        //        // IMEI2
        //        if (product.Imei2)
        //        {
        //            if (string.IsNullOrWhiteSpace(attr.IMEI2))
        //                context.AddFailure("IMEI2 is required.");
        //            else if (!Regex.IsMatch(attr.IMEI2, @"^\d{15}$"))
        //                context.AddFailure("IMEI2 must be 15 digits.");
        //        }
        //    }
        //}
    }


    public class CreateGoodsReceiveHandler : IRequestHandler<CreateGoodsReceiveRequest, CreateGoodsReceiveResult>
    {
        private readonly ICommandRepository<GoodsReceive> _goodsReceiveRepository;
        private readonly ICommandRepository<GoodsReceiveItem> _goodsReceiveItemRepository;
        private readonly ICommandRepository<GoodsReceiveItemDetails> _goodsReceiveItemDetailsRepository;

        private readonly ICommandRepository<PurchaseOrderItem> _purchaseOrderItemRepository;
        private readonly ICommandRepository<PurchaseOrder> _purchaseOrderReadRepository;
        private readonly ICommandRepository<PurchaseOrder> _purchaseOrderRepository;
        private readonly ICommandRepository<Warehouse> _warehouseRepository;
        private readonly ICommandRepository<ProductPriceDefinition> _productpriceDefRepository;
        private readonly ICommandRepository<Product> _productRepository;
        private readonly ICommandRepository<InventoryTransactionAttributesDetails> _inventoryTransactionAttributesDetailsRepository;

        private readonly IUnitOfWork _unitOfWork;
        private readonly NumberSequenceService _numberSequenceService;
        private readonly InventoryTransactionService _inventoryTransactionService;
        private readonly ISecurityService _securityService;
        private readonly IQueryContext _queryContext;

        public CreateGoodsReceiveHandler(
            ICommandRepository<GoodsReceive> goodsReceiveRepository,
            ICommandRepository<GoodsReceiveItem> goodsReceiveItemRepository,
            ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository,
        ICommandRepository<PurchaseOrderItem> purchaseOrderItemRepository,
            ICommandRepository<PurchaseOrder> purchaseOrderReadRepository,
            ICommandRepository<PurchaseOrder> purchaseOrderRepository,
            ICommandRepository<Warehouse> warehouseRepository,
            ICommandRepository<ProductPriceDefinition> productpricedefinitionrepository,
             ICommandRepository<Product> productRepository,
             ICommandRepository<InventoryTransactionAttributesDetails> inventoryTransactionAttributesDetailsRepository,

            IUnitOfWork unitOfWork,
            NumberSequenceService numberSequenceService,
            InventoryTransactionService inventoryTransactionService,
            ISecurityService securityService,
            IQueryContext queryContext)
        {
            _goodsReceiveRepository = goodsReceiveRepository;
            _goodsReceiveItemRepository = goodsReceiveItemRepository;
            _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
            _purchaseOrderItemRepository = purchaseOrderItemRepository;
            _purchaseOrderReadRepository = purchaseOrderReadRepository;
            _purchaseOrderRepository = purchaseOrderRepository;
            _warehouseRepository = warehouseRepository;
            _productpriceDefRepository = productpricedefinitionrepository;
            _productRepository = productRepository;
            _inventoryTransactionAttributesDetailsRepository = inventoryTransactionAttributesDetailsRepository;
            _unitOfWork = unitOfWork;
            _numberSequenceService = numberSequenceService;
            _inventoryTransactionService = inventoryTransactionService;
            _securityService = securityService;
            _queryContext = queryContext;

        }

        public async Task<CreateGoodsReceiveResult> Handle(CreateGoodsReceiveRequest request, CancellationToken cancellationToken)
        {
            //await using var transaction =  await _unitOfWork.BeginTransactionAsync();
            try
            {
                // ✅ Step 1: Load Purchase Order
                var po = await _purchaseOrderReadRepository.GetQuery()
                .ApplyIsDeletedFilter(false)
                .Include(x => x.PurchaseOrderItemList)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(x => x.Id == request.PurchaseOrderId, cancellationToken)
                ?? throw new InvalidOperationException($"Purchase Order '{request.PurchaseOrderId}' not found.");

            if (po.OrderStatus is PurchaseOrderStatus.Cancelled or PurchaseOrderStatus.Pending)
                throw new InvalidOperationException($"Cannot create goods receive for a {po.OrderStatus} purchase order.");

            // ✅ Step 2: Parse Status
            if (!Enum.TryParse<GoodsReceiveStatus>(request.Status, out var receiveStatus))
                throw new InvalidOperationException($"Invalid status: {request.Status}");

            // ✅ Step 3: Validate warehouse
            Warehouse? defaultWarehouse = null;
            if (!string.IsNullOrEmpty(request.DefaultWarehouseId))
            {
                defaultWarehouse = await _warehouseRepository.GetQuery()
                    .ApplyIsDeletedFilter(false)
                    .FirstOrDefaultAsync(x => x.Id == request.DefaultWarehouseId, cancellationToken)
                    ?? throw new InvalidOperationException($"Default warehouse '{request.DefaultWarehouseId}' not found.");
            }

            // ✅ Step 4: Create Header
            var goodsReceive = new GoodsReceive
            {
                Number = _numberSequenceService.GenerateNumber(nameof(GoodsReceive), "", "GR"),
                ReceiveDate = _securityService.ConvertToIst(request.ReceiveDate),
                Status = receiveStatus,
                Description = request.Description,
                PurchaseOrderId = request.PurchaseOrderId!,
                CreatedById = request.CreatedById!,
                CreatedAtUtc = DateTime.UtcNow,
                IsDeleted = false,
                FreightCharges = request.FreightCharges ?? 0,
                OtherCharges = request.OtherCharges ?? 0
            };

            await _goodsReceiveRepository.CreateAsync(goodsReceive, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // ✅ Step 5: Calculate per-unit charges
            double totalReceivedQty = request.Items.Sum(i => i.ReceivedQuantity);
            double freightPerUnit = totalReceivedQty > 0 ? (request.FreightCharges ?? 0) / totalReceivedQty : 0;
            double otherPerUnit = totalReceivedQty > 0 ? (request.OtherCharges ?? 0) / totalReceivedQty : 0;

            var createdItems = new List<GoodsReceiveItem>();
            var createdInventoryTransactions = new List<string>();

            // ✅ Step 6: Process Items
            foreach (var reqItem in request.Items)
            {
                var poItem = po.PurchaseOrderItemList.FirstOrDefault(x =>
                    string.Equals(x.Id?.Trim(), reqItem.PurchaseOrderItemId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    ?? throw new InvalidOperationException($"PurchaseOrderItem '{reqItem.PurchaseOrderItemId}' not found.");

                var remainingQty = (poItem.Quantity ?? 0) - poItem.ReceivedQuantity;
                if (reqItem.ReceivedQuantity > remainingQty)
                    throw new InvalidOperationException(
                        $"Cannot receive {reqItem.ReceivedQuantity} for item '{reqItem.PurchaseOrderItemId}'. Remaining: {remainingQty}.");

                poItem.ReceivedQuantity += reqItem.ReceivedQuantity;
                poItem.UpdatedById = request.CreatedById;
                _purchaseOrderItemRepository.Update(poItem);

                // ✅ Calculate per-item prices
                var grItem = new GoodsReceiveItem
                {
                    GoodsReceiveId = goodsReceive.Id,
                    PurchaseOrderItemId = reqItem.PurchaseOrderItemId,
                    ReceivedQuantity = reqItem.ReceivedQuantity,
                    UnitPrice = reqItem.UnitPrice ?? 0,
                    TaxAmount = reqItem.TaxAmount ?? 0,
                    FreightChargesPerUnit = Math.Round(freightPerUnit, 2),
                    OtherChargesPerUnit = Math.Round(otherPerUnit, 2),
                    FinalUnitPrice = (reqItem.UnitPrice ?? 0) + (reqItem.TaxAmount ?? 0) + freightPerUnit + otherPerUnit,
                    MRP = reqItem.MRP ?? 0,
                    Notes = reqItem.Notes,
                    CreatedById = request.CreatedById!,
                    CreatedAtUtc = DateTime.UtcNow,
                    IsDeleted = false,
                    Attribute1DetailId = reqItem.Attribute1DetailId,
                    Attribute2DetailId = reqItem.Attribute2DetailId

                };

                await _goodsReceiveItemRepository.CreateAsync(grItem, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);


                // ===============================
                // INSERT ITEM DETAILS (IMEI / Serial / Service)
                // ===============================
                //            var product = await _productRepository.GetQuery()
                //.FirstOrDefaultAsync(x => x.Id == poItem.ProductId, cancellationToken);

                //            if (product == null)
                //                throw new InvalidOperationException($"Product not found: {poItem.ProductId}");



                List<GoodsReceiveItemDetails> createdDetails = new();

                var product = await _productRepository.GetQuery()
                .FirstOrDefaultAsync(x => x.Id == poItem.ProductId, cancellationToken);
                if (product == null)
                {
                    throw new InvalidOperationException("Product not found.");
                }

                foreach (var d in reqItem.Attributes)
                {
                    if (product.ServiceNo && string.IsNullOrWhiteSpace(d.ServiceNo))
                        throw new InvalidOperationException("Service No is required.");

                    if (product.Imei1 && string.IsNullOrWhiteSpace(d.IMEI1))
                        throw new InvalidOperationException("IMEI1 is required.");
                    if (product.Imei1 && !Regex.IsMatch(d.IMEI1, @"^\d{15}$"))
                        throw new InvalidOperationException("IMEI1 must be 15 digits.");

                    if (product.Imei2 && string.IsNullOrWhiteSpace(d.IMEI2))
                        throw new InvalidOperationException("IMEI2 is required.");
                    if (product.Imei2 && !Regex.IsMatch(d.IMEI2, @"^\d{15}$"))
                        throw new InvalidOperationException("IMEI2 must be 15 digits.");
                    var detail = new GoodsReceiveItemDetails
                    {
                        GoodsReceiveItemId = grItem.Id,
                        RowIndex = d.RowIndex,
                        IMEI1 = d.IMEI1,
                        IMEI2 = d.IMEI2,
                        ServiceNo = d.ServiceNo,
                        CreatedById = request.CreatedById,
                        CreatedAtUtc = DateTime.UtcNow
                    };

                    await _goodsReceiveItemDetailsRepository.CreateAsync(detail, cancellationToken);

                    createdDetails.Add(detail); //Capture ID here
                }




                // ===============================
                // PRICE DEFINITION CHECK & UPDATE
                // ===============================
                var productId = poItem.ProductId;
                if (receiveStatus != GoodsReceiveStatus.Pending &&
                    receiveStatus != GoodsReceiveStatus.Cancelled)
                {

                    // 1️⃣ Fetch ACTIVE price definition for this product
                    var existingPrice = await _productpriceDefRepository.GetQuery()
                    .Where(p => p.ProductId == productId && p.IsActive && !p.IsDeleted)
                    .OrderByDescending(p => p.EffectiveFrom)
                    .FirstOrDefaultAsync(cancellationToken);

                // If not exists → create first entry and continue
                if (existingPrice == null)
                {
                    var newPrice = new ProductPriceDefinition
                    {
                        ProductId = productId,
                       // ProductName = request.ProductName,
                        //CostPrice = Convert.ToDecimal(grItem.UnitPrice),   // OR grItem.UnitPrice based on your rule
                        CostPrice = Convert.ToDecimal(grItem.FinalUnitPrice),   // OR grItem.FinalUnitPrice based on your rule
                        EffectiveFrom = _securityService.ConvertToIst(DateTime.UtcNow),
                        IsActive = true,                        
                   };

                    await _productpriceDefRepository.CreateAsync(newPrice, cancellationToken);
                    await _unitOfWork.SaveAsync(cancellationToken);
                }
                else
                {
                    // Compare prices
                    double oldPrice = Convert.ToDouble(existingPrice.CostPrice);
                    double newPrice = grItem.FinalUnitPrice;

                        if (Math.Round(oldPrice, 2) != Math.Round(newPrice, 2))
                        {
                            // 2️⃣ Fetch stock for weighted average
                            //var stockQty = await _inventoryTransactionService.GetCurrentStock(productId, cancellationToken);
                            var stockQty = 0.0; // TEMP FIX: Replace with actual stock fetch logic
                                                // Weighted Average Price Formula:
                                                // (ExistingStock * OldPrice + ReceivedQty * NewPrice) / (ExistingStock + ReceivedQty)
                            var result = await _queryContext
                                .InventoryTransaction
                                .AsNoTracking()
                                .ApplyIsDeletedFilter(false)
                                .Where(x => x.Status == InventoryTransactionStatus.Confirmed &&
                                            x.WarehouseId == request.DefaultWarehouseId && x.ProductId == productId)
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
                            stockQty = result.ToArray().Length > 0 ? Convert.ToDouble(result.ToArray()[0].TotalStock) : 0.0;
                            //double stockQty = result?.TotalStock ?? 0;

                            double existingValue = stockQty * oldPrice;
                            double receivedValue = grItem.ReceivedQuantity * newPrice;

                            double weightedAveragePrice =
                                (existingValue + receivedValue) / (stockQty + grItem.ReceivedQuantity);

                            weightedAveragePrice = Math.Round(weightedAveragePrice, 2);

                            // 3️⃣ Mark old price inactive
                            existingPrice.IsActive = false;
                            existingPrice.EffectiveTo = _securityService.ConvertToIst(DateTime.UtcNow);
                            _productpriceDefRepository.Update(existingPrice);

                            // 4️⃣ Insert new price definition row
                            var newPriceDef = new ProductPriceDefinition
                            {
                                ProductId = productId,
                                ProductName = existingPrice.ProductName,
                                CostPrice = Convert.ToDecimal(weightedAveragePrice),
                                EffectiveFrom = _securityService.ConvertToIst(DateTime.UtcNow),
                                IsActive = true,
                                MarginPercentage = existingPrice.MarginPercentage,
                                CurrencyCode = existingPrice.CurrencyCode
                            };

                            await _productpriceDefRepository.CreateAsync(newPriceDef, cancellationToken);
                            await _unitOfWork.SaveAsync(cancellationToken);
                        }
                    }
                }

                createdItems.Add(grItem);

                // ✅ Inventory update
                if (poItem.Product.Physical == true &&
                    receiveStatus != GoodsReceiveStatus.Pending &&
                    receiveStatus != GoodsReceiveStatus.Cancelled)
                {
                    var warehouseId = reqItem.WarehouseId ?? request.DefaultWarehouseId;
                    if (string.IsNullOrEmpty(warehouseId))
                        throw new InvalidOperationException($"Warehouse ID required for item '{reqItem.PurchaseOrderItemId}'.");

                    var warehouse = await _warehouseRepository.GetQuery()
                        .ApplyIsDeletedFilter(false)
                        .FirstOrDefaultAsync(x => x.Id == warehouseId, cancellationToken)
                        ?? throw new InvalidOperationException($"Warehouse '{warehouseId}' not found.");

                    var inventoryTx = await _inventoryTransactionService.GoodsReceiveCreateInvenTrans(
                        goodsReceive.Id,
                        warehouseId,
                        poItem.ProductId,
                        reqItem.ReceivedQuantity,
                        request.CreatedById,
                        cancellationToken);

                    if (inventoryTx != null)
                        createdInventoryTransactions.Add(inventoryTx.Id);

                    // ------------------------------------------
                    // STORE ONLY THE CREATED GOODSRECEIVEITEMDETAIL IDs
                    // ------------------------------------------
                    foreach (var det in createdDetails)
                    {
                        var invDetail = new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTx.Id,   // FK to InventoryTransaction
                            GoodsReceiveItemDetailsId = det.Id,        // FK to GoodsReceiveItemDetails
                            CreatedById = request.CreatedById,
                            CreatedAtUtc = DateTime.UtcNow
                        };

                        await _inventoryTransactionAttributesDetailsRepository.CreateAsync(invDetail, cancellationToken);
                    }

                }
            }

            await _unitOfWork.SaveAsync(cancellationToken);
            //await transaction.CommitAsync(cancellationToken);

            return new CreateGoodsReceiveResult
            {
                Data = goodsReceive,
                Items = createdItems,
                CreatedInventoryTransactions = createdInventoryTransactions
            };

        }
    catch
    {

        throw; // rethrow so API gets the error
    }

}
    }
}
