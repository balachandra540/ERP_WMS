using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SalesReturnManager.Commands;

// 1. Define the item structure for the batch update
public class UpdateSalesReturnItemRequest
{
    public string? Id { get; init; } // If null/empty, it's a new row added in the grid
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }
    public double Movement { get; init; }
}

public class UpdateSalesReturnResult
{
    public SalesReturn? Data { get; set; }
}

// 2. Update the Request to include the Batch Items list
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

public class UpdateSalesReturnHandler : IRequestHandler<UpdateSalesReturnRequest, UpdateSalesReturnResult>
{
    private readonly ICommandRepository<SalesReturn> _repository;
    private readonly ICommandRepository<InventoryTransaction> _itemRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public UpdateSalesReturnHandler(
        ICommandRepository<SalesReturn> repository,
        ICommandRepository<InventoryTransaction> itemRepository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService
        )
    {
        _repository = repository;
        _itemRepository = itemRepository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<UpdateSalesReturnResult> Handle(UpdateSalesReturnRequest request, CancellationToken cancellationToken)
    {
        // 3. Update Sales Return Header
        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.UpdatedById;
        entity.ReturnDate = _securityService.ConvertToIst(request.ReturnDate);
        entity.Status = (SalesReturnStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.DeliveryOrderId = request.DeliveryOrderId;

        _repository.Update(entity);

        // 4. Synchronize Secondary Data (Items)
        // Get currently existing items in the DB for this record
        var existingDbItems = await _itemRepository.GetQuery()
            .Where(x => x.ModuleId == entity.Id && x.ModuleName == nameof(SalesReturn))
            .ToListAsync(cancellationToken);

        // A. DELETE: Items that exist in DB but are no longer in the grid
        var incomingIds = request.Items
            .Where(x => !string.IsNullOrEmpty(x.Id))
            .Select(x => x.Id)
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

        // B. ADD or UPDATE: Loop through the batch items from the frontend
        foreach (var incomingItem in request.Items)
        {
            if (string.IsNullOrEmpty(incomingItem.Id))
            {
                // ADD: Create new inventory transaction for added rows
                await _inventoryTransactionService.SalesReturnCreateInvenTrans(
                    entity.Id,
                    incomingItem.WarehouseId,
                    incomingItem.ProductId,
                    incomingItem.Movement,
                    request.UpdatedById,
                    cancellationToken
                );
            }
            else
            {
                // UPDATE: Update existing rows with modified quantities or warehouses
                await _inventoryTransactionService.SalesReturnUpdateInvenTrans(
                    incomingItem.Id,
                    incomingItem.WarehouseId,
                    incomingItem.ProductId,
                    incomingItem.Movement,
                    request.UpdatedById,
                    cancellationToken
                );
            }
        }

        // 5. Commit all changes to the database
        await _unitOfWork.SaveAsync(cancellationToken);

        // 6. Propagate changes (like Status or Date) to the linked transactions
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

        return new UpdateSalesReturnResult { Data = entity };
    }
}