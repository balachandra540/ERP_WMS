using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PurchaseReturnManager.Commands;

public class UpdatePurchaseReturnResult
{
    public PurchaseReturn? Data { get; set; }
}

public class PurchaseReturnUpdateItemDto
{
    public string? InventoryTransactionId { get; init; } // null = new line
    public string WarehouseId { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public double Movement { get; init; }   // 🔻 Return quantity
    public string? Summary { get; init; }
    public List<PurchaseReturnUpdateItemDetailDto> Attributes { get; init; } = new();
}

public class PurchaseReturnUpdateItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}

public class UpdatePurchaseReturnRequest
    : IRequest<UpdatePurchaseReturnResult>
{
    public string PurchaseReturnId { get; init; } = string.Empty;
    public DateTime ReturnDate { get; init; }
    public PurchaseReturnStatus Status { get; init; }
    public string? Description { get; init; }
    public string GoodsReceiveId { get; init; } = string.Empty;
    public string UpdatedById { get; init; } = string.Empty;

    public List<PurchaseReturnUpdateItemDto> Items { get; init; } = new();
    public List<string> DeletedItems { get; init; } = new(); // InventoryTransactionIds
}


public class UpdatePurchaseReturnValidator
    : AbstractValidator<UpdatePurchaseReturnRequest>
{
    public UpdatePurchaseReturnValidator()
    {
        RuleFor(x => x.PurchaseReturnId).NotEmpty();
        RuleFor(x => x.ReturnDate).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.GoodsReceiveId).NotEmpty();
        RuleFor(x => x.UpdatedById).NotEmpty();

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("At least one item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.WarehouseId).NotEmpty();
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Movement).GreaterThan(0);
        });
    }
}

public class UpdatePurchaseReturnHandler
    : IRequestHandler<UpdatePurchaseReturnRequest, UpdatePurchaseReturnResult>
{
    private readonly ICommandRepository<PurchaseReturn> _purchaseReturnRepo;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrRepo;
    private readonly ICommandRepository<GoodsReceiveItemDetails> _grItemRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryService;
    private readonly ISecurityService _security;

    public UpdatePurchaseReturnHandler(
        ICommandRepository<PurchaseReturn> purchaseReturnRepo,
        ICommandRepository<InventoryTransactionAttributesDetails> attrRepo,
        ICommandRepository<GoodsReceiveItemDetails> grItemRepo,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryService,
        ISecurityService security)
    {
        _purchaseReturnRepo = purchaseReturnRepo;
        _attrRepo = attrRepo;
        _grItemRepo = grItemRepo;
        _unitOfWork = unitOfWork;
        _inventoryService = inventoryService;
        _security = security;
    }

    public async Task<UpdatePurchaseReturnResult> Handle(
        UpdatePurchaseReturnRequest request,
        CancellationToken cancellationToken)
    {
        // 1️⃣ Load header
        var entity = await _purchaseReturnRepo.GetQuery()
            .ApplyIsDeletedFilter(false)
            .FirstOrDefaultAsync(
                x => x.Id == request.PurchaseReturnId,
                cancellationToken)
            ?? throw new ValidationException("Purchase Return not found.");

        entity.ReturnDate = _security.ConvertToIst(request.ReturnDate);
        entity.Status = request.Status;
        entity.Description = request.Description;
        entity.GoodsReceiveId = request.GoodsReceiveId;
        entity.UpdatedById = request.UpdatedById;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        // 2️⃣ Deleted inventory transactions
        foreach (var invId in request.DeletedItems.Where(x => !string.IsNullOrWhiteSpace(x)))
        {
            await _inventoryService.PurchaseReturnDeleteInvenTrans(
                invId,
                request.UpdatedById,
                cancellationToken);
        }

        // 3️⃣ Process items
        foreach (var item in request.Items)
        {
            InventoryTransaction invTx;

            if (string.IsNullOrEmpty(item.InventoryTransactionId))
            {
                // ➕ Create
                invTx = await _inventoryService.PurchaseReturnCreateInvenTrans(
                    entity.Id,
                    item.WarehouseId,
                    item.ProductId,
                    item.Movement,
                    request.UpdatedById,
                    cancellationToken);
            }
            else
            {
                // ✏️ Update
                invTx = await _inventoryService.PurchaseReturnUpdateInvenTrans(
                    item.InventoryTransactionId,
                    item.WarehouseId,
                    item.ProductId,
                    item.Movement,
                    request.UpdatedById,
                    cancellationToken);
            }

            // 4️⃣ Sync attributes
            await SyncAttributes(
                invTx.Id,
                item.Attributes,
                request.UpdatedById,
                cancellationToken);
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        // 5️⃣ 🔥 PROPAGATE PARENT UPDATE (IMPORTANT)
        await _inventoryService.PropagateParentUpdate(
            entity.Id,
            nameof(PurchaseReturn),
            entity.ReturnDate,
            (InventoryTransactionStatus?)entity.Status,
            entity.IsDeleted,
            entity.UpdatedById,
            null,
            cancellationToken
        );

        await _unitOfWork.SaveAsync(cancellationToken);


        return new UpdatePurchaseReturnResult { Data = entity };
    }

    private async Task SyncAttributes(
        string inventoryTransactionId,
        List<PurchaseReturnUpdateItemDetailDto> attrs,
        string userId,
        CancellationToken ct)
    {
        if (attrs == null || !attrs.Any())
            return;

        var existing = await _attrRepo.GetQuery()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.InventoryTransactionId == inventoryTransactionId)
            .ToListAsync(ct);

        foreach (var attr in attrs)
        {
            var query = _grItemRepo.GetQuery()
                .ApplyIsDeletedFilter(false);

            if (!string.IsNullOrEmpty(attr.IMEI1))
                query = query.Where(x => x.IMEI1 == attr.IMEI1);
            else if (!string.IsNullOrEmpty(attr.IMEI2))
                query = query.Where(x => x.IMEI2 == attr.IMEI2);
            else if (!string.IsNullOrEmpty(attr.ServiceNo))
                query = query.Where(x => x.ServiceNo == attr.ServiceNo);
            else
                throw new ValidationException(
                    $"Row {attr.RowIndex}: IMEI or ServiceNo required.");

            var detailId = await query
                .Select(x => x.Id)
                .SingleOrDefaultAsync(ct)
                ?? throw new ValidationException(
                    $"Row {attr.RowIndex}: IMEI / ServiceNo not found.");

            if (!existing.Any(x => x.GoodsReceiveItemDetailsId == detailId))
            {
                await _attrRepo.CreateAsync(
                    new InventoryTransactionAttributesDetails
                    {
                        InventoryTransactionId = inventoryTransactionId,
                        GoodsReceiveItemDetailsId = detailId,
                        CreatedById = userId,
                        CreatedAtUtc = DateTime.UtcNow
                    },
                    ct);
            }
        }

        // Optional: soft-delete removed attributes
    }
}
