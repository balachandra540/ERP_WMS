using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.SalesReturnManager.Commands;

// 1. Define the item structure coming from the Vue Grid
public class CreateSalesReturnItemRequest
{
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }
    public double Movement { get; init; }
}

public class CreateSalesReturnResult
{
    public SalesReturn? Data { get; set; }
}

// 2. Update the Request to include the Items list
public class CreateSalesReturnRequest : IRequest<CreateSalesReturnResult>
{
    public DateTime? ReturnDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? DeliveryOrderId { get; init; }
    public string? CreatedById { get; init; }
    public List<CreateSalesReturnItemRequest> Items { get; init; } = new();
}

public class CreateSalesReturnHandler : IRequestHandler<CreateSalesReturnRequest, CreateSalesReturnResult>
{
    private readonly ICommandRepository<SalesReturn> _salesReturnRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public CreateSalesReturnHandler(
        ICommandRepository<SalesReturn> salesReturnRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService
        )
    {
        _salesReturnRepository = salesReturnRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<CreateSalesReturnResult> Handle(CreateSalesReturnRequest request, CancellationToken cancellationToken = default)
    {
        // 3. Create the Sales Return Header
        var entity = new SalesReturn();
        entity.CreatedById = request.CreatedById;
        entity.Number = _numberSequenceService.GenerateNumber(nameof(SalesReturn), "", "SRN");
        entity.ReturnDate = _securityService.ConvertToIst(request.ReturnDate);
        entity.Status = (SalesReturnStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.DeliveryOrderId = request.DeliveryOrderId;

        await _salesReturnRepository.CreateAsync(entity, cancellationToken);

        // Save the header first to generate the entity.Id needed for transactions
        await _unitOfWork.SaveAsync(cancellationToken);

        // 4. Process the Items sent from the Frontend Grid
        if (request.Items != null && request.Items.Any())
        {
            foreach (var item in request.Items)
            {
                // We no longer fetch from database; we use the data sent by the user
                await _inventoryTransactionService.SalesReturnCreateInvenTrans(
                    entity.Id, // Linking to the new Sales Return
                    item.WarehouseId,
                    item.ProductId,
                    item.Movement,
                    entity.CreatedById,
                    cancellationToken
                );
            }

            // Save the newly created inventory transactions
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        return new CreateSalesReturnResult
        {
            Data = entity
        };
    }
}