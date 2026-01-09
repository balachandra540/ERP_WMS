//using Application.Common.Repositories;
//using Application.Common.Services.SecurityManager;
//using Application.Features.InventoryTransactionManager;
//using Domain.Entities;
//using Domain.Enums;
//using MediatR;
//using Microsoft.EntityFrameworkCore;

//namespace Application.Features.SalesReturnManager.Commands;

//// 1. Define the item structure for the batch update
//public class UpdateSalesReturnItemRequest
//{
//    public string? Id { get; init; } // If null/empty, it's a new row added in the grid
//    public string? WarehouseId { get; init; }
//    public string? ProductId { get; init; }
//    public double Movement { get; init; }
//}

//public class UpdateSalesReturnResult
//{
//    public SalesReturn? Data { get; set; }
//}

//// 2. Update the Request to include the Batch Items list
//public class UpdateSalesReturnRequest : IRequest<UpdateSalesReturnResult>
//{
//    public string? Id { get; init; }
//    public DateTime? ReturnDate { get; init; }
//    public string? Status { get; init; }
//    public string? Description { get; init; }
//    public string? DeliveryOrderId { get; init; }
//    public string? UpdatedById { get; init; }
//    public List<UpdateSalesReturnItemRequest> Items { get; init; } = new();
//}

//public class UpdateSalesReturnHandler : IRequestHandler<UpdateSalesReturnRequest, UpdateSalesReturnResult>
//{
//    private readonly ICommandRepository<SalesReturn> _repository;
//    private readonly ICommandRepository<InventoryTransaction> _itemRepository;
//    private readonly IUnitOfWork _unitOfWork;
//    private readonly InventoryTransactionService _inventoryTransactionService;
//    private readonly ISecurityService _securityService;

//    public UpdateSalesReturnHandler(
//        ICommandRepository<SalesReturn> repository,
//        ICommandRepository<InventoryTransaction> itemRepository,
//        IUnitOfWork unitOfWork,
//        InventoryTransactionService inventoryTransactionService,
//        ISecurityService securityService
//        )
//    {
//        _repository = repository;
//        _itemRepository = itemRepository;
//        _unitOfWork = unitOfWork;
//        _inventoryTransactionService = inventoryTransactionService;
//        _securityService = securityService;
//    }

//    public async Task<UpdateSalesReturnResult> Handle(UpdateSalesReturnRequest request, CancellationToken cancellationToken)
//    {
//        // 3. Update Sales Return Header
//        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

//        if (entity == null)
//        {
//            throw new Exception($"Entity not found: {request.Id}");
//        }

//        entity.UpdatedById = request.UpdatedById;
//        entity.ReturnDate = _securityService.ConvertToIst(request.ReturnDate);
//        entity.Status = (SalesReturnStatus)int.Parse(request.Status!);
//        entity.Description = request.Description;
//        entity.DeliveryOrderId = request.DeliveryOrderId;

//        _repository.Update(entity);

//        // 4. Synchronize Secondary Data (Items)
//        // Get currently existing items in the DB for this record
//        var existingDbItems = await _itemRepository.GetQuery()
//            .Where(x => x.ModuleId == entity.Id && x.ModuleName == nameof(SalesReturn))
//            .ToListAsync(cancellationToken);

//        // A. DELETE: Items that exist in DB but are no longer in the grid
//        var incomingIds = request.Items
//            .Where(x => !string.IsNullOrEmpty(x.Id))
//            .Select(x => x.Id)
//            .ToList();

//        var itemsToDelete = existingDbItems
//            .Where(x => !incomingIds.Contains(x.Id))
//            .ToList();

//        foreach (var item in itemsToDelete)
//        {
//            await _inventoryTransactionService.SalesReturnDeleteInvenTrans(
//                item.Id,
//                request.UpdatedById,
//                cancellationToken
//            );
//        }

//        // B. ADD or UPDATE: Loop through the batch items from the frontend
//        foreach (var incomingItem in request.Items)
//        {
//            if (string.IsNullOrEmpty(incomingItem.Id))
//            {
//                // ADD: Create new inventory transaction for added rows
//                await _inventoryTransactionService.SalesReturnCreateInvenTrans(
//                    entity.Id,
//                    incomingItem.WarehouseId,
//                    incomingItem.ProductId,
//                    incomingItem.Movement,
//                    request.UpdatedById,
//                    cancellationToken
//                );
//            }
//            else
//            {
//                // UPDATE: Update existing rows with modified quantities or warehouses
//                await _inventoryTransactionService.SalesReturnUpdateInvenTrans(
//                    incomingItem.Id,
//                    incomingItem.WarehouseId,
//                    incomingItem.ProductId,
//                    incomingItem.Movement,
//                    request.UpdatedById,
//                    cancellationToken
//                );
//            }
//        }

//        // 5. Commit all changes to the database
//        await _unitOfWork.SaveAsync(cancellationToken);

//        // 6. Propagate changes (like Status or Date) to the linked transactions
//        await _inventoryTransactionService.PropagateParentUpdate(
//            entity.Id,
//            nameof(SalesReturn),
//            entity.ReturnDate,
//            (InventoryTransactionStatus?)entity.Status,
//            entity.IsDeleted,
//            entity.UpdatedById,
//            null,
//            cancellationToken
//        );

//        return new UpdateSalesReturnResult { Data = entity };
//    }
//}

using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SalesReturnManager.Commands;

#region ===== DTOs =====

// 🔹 Attribute DTO
public class UpdateSalesReturnItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}

// 🔹 Item DTO for batch update
public class UpdateSalesReturnItemRequest
{
    public string? Id { get; init; }              // InventoryTransactionId
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }

    // 🔥 returnQuantity
    public double Movement { get; init; }

    // 🔥 selected attributes only
    public List<UpdateSalesReturnItemDetailDto> Attributes { get; init; } = new();
}

#endregion

#region ===== Request / Result =====

public class UpdateSalesReturnResult
{
    public SalesReturn? Data { get; set; }
}

public class UpdateSalesReturnRequest : IRequest<UpdateSalesReturnResult>
{
    public string? Id { get; init; }
    public DateTime? ReturnDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? DeliveryOrderId { get; init; }
    public string? UpdatedById { get; init; }
    public List<UpdateSalesReturnItemRequest> Items { get; init; } = new();
}

#endregion

#region ===== Validator =====

public class UpdateSalesReturnValidator : AbstractValidator<UpdateSalesReturnRequest>
{
    public UpdateSalesReturnValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ReturnDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.WarehouseId).NotEmpty();
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Movement).GreaterThan(0);
        });
    }
}

#endregion

#region ===== Handler =====

public class UpdateSalesReturnHandler
    : IRequestHandler<UpdateSalesReturnRequest, UpdateSalesReturnResult>
{
    private readonly ICommandRepository<SalesReturn> _repository;
    private readonly ICommandRepository<InventoryTransaction> _itemRepository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails>
        _attrDetailsRepository;
    private readonly ICommandRepository<GoodsReceiveItemDetails>
        _goodsReceiveItemDetailsRepository;

    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public UpdateSalesReturnHandler(
        ICommandRepository<SalesReturn> repository,
        ICommandRepository<InventoryTransaction> itemRepository,
        ICommandRepository<InventoryTransactionAttributesDetails> attrDetailsRepository,
        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService)
    {
        _repository = repository;
        _itemRepository = itemRepository;
        _attrDetailsRepository = attrDetailsRepository;
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<UpdateSalesReturnResult> Handle(
        UpdateSalesReturnRequest request,
        CancellationToken cancellationToken)
    {
        // 🔹 1. Update Header
        var entity = await _repository.GetAsync(request.Id!, cancellationToken)
            ?? throw new Exception($"SalesReturn not found: {request.Id}");

        entity.UpdatedById = request.UpdatedById;
        entity.ReturnDate = _securityService.ConvertToIst(request.ReturnDate);
        entity.Status = (SalesReturnStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.DeliveryOrderId = request.DeliveryOrderId;

        _repository.Update(entity);

        // 🔹 2. Load existing inventory transactions
        var existingDbItems = await _itemRepository.GetQuery()
            .Where(x => x.ModuleId == entity.Id &&
                        x.ModuleName == nameof(SalesReturn))
            .ToListAsync(cancellationToken);

        // 🔹 3. DELETE removed rows
        var incomingIds = request.Items
            .Where(x => !string.IsNullOrEmpty(x.Id))
            .Select(x => x.Id!)
            .ToList();

        var itemsToDelete = existingDbItems
            .Where(x => !incomingIds.Contains(x.Id))
            .ToList();

        foreach (var item in itemsToDelete)
        {
            await _inventoryTransactionService.SalesReturnDeleteInvenTrans(
                item.Id,
                request.UpdatedById,
                cancellationToken
            );
        }

        // 🔹 4. ADD / UPDATE rows
        foreach (var incomingItem in request.Items)
        {
            InventoryTransaction inventoryTx;

            if (string.IsNullOrEmpty(incomingItem.Id))
            {
                // ADD
                inventoryTx =
                    await _inventoryTransactionService.SalesReturnCreateInvenTrans(
                        entity.Id,
                        incomingItem.WarehouseId,
                        incomingItem.ProductId,
                        incomingItem.Movement,
                        request.UpdatedById,
                        cancellationToken);
            }
            else
            {
                // UPDATE
                inventoryTx =
                    await _inventoryTransactionService.SalesReturnUpdateInvenTrans(
                        incomingItem.Id,
                        incomingItem.WarehouseId,
                        incomingItem.ProductId,
                        incomingItem.Movement,
                        request.UpdatedById,
                        cancellationToken);
            }

            // 🔥 5. HANDLE ATTRIBUTES (DELETE + INSERT)
            var existingAttrs = await _attrDetailsRepository.GetQuery()
                .Where(x => x.InventoryTransactionId == inventoryTx.Id)
                .ToListAsync(cancellationToken);

            foreach (var attr in existingAttrs)
            {
                _attrDetailsRepository.Delete(attr);
            }

            if (incomingItem.Attributes != null && incomingItem.Attributes.Any())
            {
                foreach (var attr in incomingItem.Attributes)
                {
                    var query = _goodsReceiveItemDetailsRepository
                        .GetQuery()
                        .ApplyIsDeletedFilter(false);

                    if (!string.IsNullOrEmpty(attr.IMEI1))
                        query = query.Where(x => x.IMEI1 == attr.IMEI1);
                    else if (!string.IsNullOrEmpty(attr.IMEI2))
                        query = query.Where(x => x.IMEI2 == attr.IMEI2);
                    else if (!string.IsNullOrEmpty(attr.ServiceNo))
                        query = query.Where(x => x.ServiceNo == attr.ServiceNo);
                    else
                        throw new ValidationException(
                            $"No IMEI / ServiceNo provided (Row {attr.RowIndex})");

                    var goodsReceiveItemDetailId = await query
                        .Select(x => x.Id)
                        .SingleOrDefaultAsync(cancellationToken);

                    if (string.IsNullOrEmpty(goodsReceiveItemDetailId))
                        throw new ValidationException(
                            $"IMEI / ServiceNo not found (Row {attr.RowIndex})");

                    await _attrDetailsRepository.CreateAsync(
                        new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTx.Id,
                            GoodsReceiveItemDetailsId = goodsReceiveItemDetailId,
                            CreatedById = request.UpdatedById,
                            CreatedAtUtc = DateTime.UtcNow
                        },
                        cancellationToken);
                }
            }
        }

        // 🔹 6. Save
        await _unitOfWork.SaveAsync(cancellationToken);

        // 🔹 7. Propagate parent changes
        await _inventoryTransactionService.PropagateParentUpdate(
            entity.Id,
            nameof(SalesReturn),
            entity.ReturnDate,
            (InventoryTransactionStatus?)entity.Status,
            entity.IsDeleted,
            entity.UpdatedById,
            null,
            cancellationToken
        );

        return new UpdateSalesReturnResult
        {
            Data = entity
        };
    }
}

#endregion
