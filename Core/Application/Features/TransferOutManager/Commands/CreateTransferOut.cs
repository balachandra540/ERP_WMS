using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.TransferOutManager.Commands;

// Models for the combined operation
public class CreateTransferOutWithInventoryRequest : IRequest<CreateTransferOutWithInventoryResult>
{
    // TransferOut properties
    public DateTime? TransferReleaseDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? WarehouseFromId { get; init; }
    public string? WarehouseToId { get; init; }
    public string? CreatedById { get; init; }

    // Collection of items for InventoryTransactions
    public List<InventoryItem> Items { get; init; } = new List<InventoryItem>();
}


public class CreateTransferOutWithInventoryResult
{
    public TransferOut? TransferOutData { get; set; }
    public List<InventoryTransaction> InventoryTransactionData { get; set; } = new List<InventoryTransaction>();
}

public class CreateTransferOutWithInventoryValidator : AbstractValidator<CreateTransferOutWithInventoryRequest>
{
    public CreateTransferOutWithInventoryValidator()
    {
        // TransferOut validation rules
        RuleFor(x => x.TransferReleaseDate).NotEmpty().WithMessage("Transfer release date is required.");
        RuleFor(x => x.Status).NotEmpty().WithMessage("Status is required.");
        RuleFor(x => x.WarehouseFromId).NotEmpty().WithMessage("Source warehouse is required.");
        RuleFor(x => x.WarehouseToId).NotEmpty().WithMessage("Destination warehouse is required.");
        RuleFor(x => x.CreatedById).NotEmpty().WithMessage("Created by ID is required.");

        // Inventory items validation rules
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one inventory item is required.")
            .Must(items => items.All(item => !string.IsNullOrEmpty(item.ProductId) && item.Movement.HasValue))
            .WithMessage("All items must have a valid ProductId and Movement.");

        RuleForEach(x => x.Items)
            .ChildRules(item =>
            {
                item.RuleFor(x => x.ProductId).NotEmpty().WithMessage("Product ID is required for each item.");
                item.RuleFor(x => x.Movement).NotEmpty().WithMessage("Movement is required for each item.");
            });
    }
}

public class CreateTransferOutWithInventoryHandler : IRequestHandler<CreateTransferOutWithInventoryRequest, CreateTransferOutWithInventoryResult>
{
    private readonly ICommandRepository<TransferOut> _transferOutRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly ISecurityService _securityService;
    private readonly InventoryTransactionService _inventoryTransactionService;

    public CreateTransferOutWithInventoryHandler(
        ICommandRepository<TransferOut> transferOutRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        ISecurityService securityService,
        InventoryTransactionService inventoryTransactionService)
    {
        _transferOutRepository = transferOutRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _securityService = securityService;
        _inventoryTransactionService = inventoryTransactionService;
    }

    public async Task<CreateTransferOutWithInventoryResult> Handle(CreateTransferOutWithInventoryRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // Step 1: Create TransferOut
            var transferOut = new TransferOut
            {
                CreatedById = request.CreatedById,
                Number = _numberSequenceService.GenerateNumber(nameof(TransferOut), "", "OUT"),
                TransferReleaseDate = _securityService.ConvertToIst(request.TransferReleaseDate),
                Status = (TransferStatus)int.Parse(request.Status!),
                Description = request.Description,
                WarehouseFromId = request.WarehouseFromId,
                WarehouseToId = request.WarehouseToId
            };

            await _transferOutRepository.CreateAsync(transferOut, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // Step 2: Create InventoryTransactions for each item
            var inventoryTransactions = new List<InventoryTransaction>();
            foreach (var item in request.Items)
            {
                var inventoryTransaction = await _inventoryTransactionService.TransferOutCreateInvenTrans(
                    transferOut.Id, // Use TransferOut ID as ModuleId
                    item.ProductId,
                    item.Movement,
                    request.CreatedById,
                    cancellationToken);

                inventoryTransactions.Add(inventoryTransaction);
            }

            // Save all changes
            await _unitOfWork.SaveAsync(cancellationToken);

            return new CreateTransferOutWithInventoryResult
            {
                TransferOutData = transferOut,
                InventoryTransactionData = inventoryTransactions
            };
        }
        catch
        {
            // Since explicit transaction management is not available, rely on SaveAsync for atomicity
            throw; // Let the exception bubble up to be handled by the caller
        }
    }
}
