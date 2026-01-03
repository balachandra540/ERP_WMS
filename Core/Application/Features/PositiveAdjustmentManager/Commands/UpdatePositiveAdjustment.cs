using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.PositiveAdjustmentManager.Commands;

#region RESULT

public class UpdatePositiveAdjustmentResult
{
    public PositiveAdjustment? Data { get; set; }
}

#endregion

#region DTOs

public class PositiveAdjustmentUpdateItemDto
{
    public string? InventoryTransactionId { get; init; } // null = new line
    public string WarehouseId { get; init; } = string.Empty;
    public string ProductId { get; init; } = string.Empty;
    public double Movement { get; init; }
    public string? Summary { get; init; }
    public List<PositiveAdjustmentUpdateItemDetailDto> Attributes { get; init; } = new();
}

public class PositiveAdjustmentUpdateItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}

#endregion

#region REQUEST

public class UpdatePositiveAdjustmentRequest
    : IRequest<UpdatePositiveAdjustmentResult>
{
    public string PositiveAdjustmentId { get; init; } = string.Empty;
    public DateTime AdjustmentDate { get; init; }
    public AdjustmentStatus Status { get; init; }
    public string? Description { get; init; }
    public string UpdatedById { get; init; } = string.Empty;

    public List<PositiveAdjustmentUpdateItemDto> Items { get; init; } = new();
    public List<string> DeletedItems { get; init; } = new();
}

#endregion

#region VALIDATOR

public class UpdatePositiveAdjustmentValidator
    : AbstractValidator<UpdatePositiveAdjustmentRequest>
{
    public UpdatePositiveAdjustmentValidator()
    {
        RuleFor(x => x.PositiveAdjustmentId).NotEmpty();
        RuleFor(x => x.AdjustmentDate).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
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

#endregion

#region HANDLER

public class UpdatePositiveAdjustmentHandler
    : IRequestHandler<UpdatePositiveAdjustmentRequest, UpdatePositiveAdjustmentResult>
{
    private readonly ICommandRepository<PositiveAdjustment> _positiveAdjustmentRepo;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrRepo;
    private readonly ICommandRepository<GoodsReceiveItemDetails> _grItemRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryService;
    private readonly ISecurityService _security;

    public UpdatePositiveAdjustmentHandler(
        ICommandRepository<PositiveAdjustment> positiveAdjustmentRepo,
        ICommandRepository<InventoryTransactionAttributesDetails> attrRepo,
        ICommandRepository<GoodsReceiveItemDetails> grItemRepo,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryService,
        ISecurityService security)
    {
        _positiveAdjustmentRepo = positiveAdjustmentRepo;
        _attrRepo = attrRepo;
        _grItemRepo = grItemRepo;
        _unitOfWork = unitOfWork;
        _inventoryService = inventoryService;
        _security = security;
    }

    public async Task<UpdatePositiveAdjustmentResult> Handle(
        UpdatePositiveAdjustmentRequest request,
        CancellationToken cancellationToken)
    {
        // 1️⃣ Load header
        var entity = await _positiveAdjustmentRepo.GetQuery()
            .ApplyIsDeletedFilter(false)
            .FirstOrDefaultAsync(
                x => x.Id == request.PositiveAdjustmentId,
                cancellationToken)
            ?? throw new ValidationException("Positive Adjustment not found.");

        entity.AdjustmentDate = _security.ConvertToIst(request.AdjustmentDate);
        entity.Status = request.Status;
        entity.Description = request.Description;
        entity.UpdatedById = request.UpdatedById;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        // 2️⃣ Deleted inventory transactions
        foreach (var invId in request.DeletedItems.Where(x => !string.IsNullOrWhiteSpace(x)))
        {
            await _inventoryService.PositiveAdjustmentDeleteInvenTrans(
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
                invTx = await _inventoryService.PositiveAdjustmentCreateInvenTrans(
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
                invTx = await _inventoryService.PositiveAdjustmentUpdateInvenTrans(
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

        return new UpdatePositiveAdjustmentResult { Data = entity };
    }

    private async Task SyncAttributes(
        string inventoryTransactionId,
        List<PositiveAdjustmentUpdateItemDetailDto> attrs,
        string userId,
        CancellationToken ct)
    {
        if (attrs == null || !attrs.Any())
            return;

        var existing = await _attrRepo.GetQuery()
            .ApplyIsDeletedFilter(false)
            .Where(x => x.InventoryTransactionId == inventoryTransactionId)
            .ToListAsync(ct);

        var incomingIds = new HashSet<string>();

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

            incomingIds.Add(detailId);

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

        //// 🗑 Soft delete removed attributes
        //foreach (var removed in existing
        //             .Where(x => !incomingIds.Contains(x.GoodsReceiveItemDetailsId)))
        //{
        //    removed.IsDeleted = true;
        //    removed.DeletedById = userId;
        //    removed.DeletedAtUtc = DateTime.UtcNow;
        //}
    }
}

#endregion
