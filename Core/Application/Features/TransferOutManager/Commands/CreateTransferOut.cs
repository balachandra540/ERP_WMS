using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
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

    // ✅ NEW: Serial / IMEI level details
    
}
public class TransferOutDetailRequest
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
    public string? Id { get; init; }
}


public class CreateTransferOutWithInventoryResult
{
    public TransferOut? Data { get; set; }
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
    private readonly ICommandRepository<TransferOutDetails> _transferOutDetailRepository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrRepository;
    //private readonly ICommandRepository<GoodsReceiveItemDetails> _GoodsReceiveItemDetailsRepository;

    private readonly IQueryContext _queryContext;

    public CreateTransferOutWithInventoryHandler(
        ICommandRepository<TransferOut> transferOutRepository,
        ICommandRepository<TransferOutDetails> transferOutDetailRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        ISecurityService securityService,
        InventoryTransactionService inventoryTransactionService,
        ICommandRepository<InventoryTransactionAttributesDetails> attrRepository,
        //ICommandRepository<GoodsReceiveItemDetails> GoodsReceiveItemDetailsRepository,
        IQueryContext queryContext
)
    {
        _transferOutRepository = transferOutRepository;
        _transferOutDetailRepository = transferOutDetailRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _securityService = securityService;
        _inventoryTransactionService = inventoryTransactionService;
        //_GoodsReceiveItemDetailsRepository = GoodsReceiveItemDetailsRepository;
        _queryContext = queryContext;
        _attrRepository = attrRepository;
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

            // Step 4: Create InventoryTransactions and link to TransferOutDetails
            var inventoryTransactions = new List<InventoryTransaction>();
            foreach (var item in request.Items)
            {
                // Create inventory transaction
                var inventoryTransaction = await _inventoryTransactionService.TransferOutCreateInvenTrans(
                    transferOut.Id, // Use TransferOut ID as ModuleId
                    item.ProductId,
                    item.Movement,
                    request.CreatedById,
                    cancellationToken);

                inventoryTransactions.Add(inventoryTransaction);

                foreach (var d in item.Details)
                {
                    //var detail = new TransferOutDetails
                    //{
                    //    TransferOutId = transferOut.Id,
                    //    RowIndex = d.RowIndex,
                    //    IMEI1 = d.IMEI1,
                    //    IMEI2 = d.IMEI2,
                    //    ServiceNo = d.ServiceNo,
                    //    CreatedById = request.CreatedById,
                    //    CreatedAtUtc = DateTime.UtcNow
                    //};
                    //await _transferOutDetailRepository.CreateAsync(detail, cancellationToken);
                    //await _unitOfWork.SaveAsync(cancellationToken);

                    var goodsReceiveDetail = await _queryContext.GoodsReceiveItemDetails
                    .AsNoTracking()
                    .Where(x =>
                        !x.IsDeleted &&
                        (
                            (!string.IsNullOrEmpty(d.IMEI1) && x.IMEI1 == d.IMEI1) ||
                            (!string.IsNullOrEmpty(d.IMEI2) && x.IMEI2 == d.IMEI2) ||
                            (!string.IsNullOrEmpty(d.ServiceNo) && x.ServiceNo == d.ServiceNo)
                        )
                    )
                    .FirstOrDefaultAsync(cancellationToken);
                    if (goodsReceiveDetail == null)
                    {
                        throw new Exception(
                            $"GoodsReceive item not found. " +
                            $"IMEI1:{d.IMEI1}, IMEI2:{d.IMEI2}, ServiceNo:{d.ServiceNo}");
                    }

                    var attr = new InventoryTransactionAttributesDetails
                    {
                        InventoryTransactionId = inventoryTransaction.Id,
                        GoodsReceiveItemDetailsId = goodsReceiveDetail.Id,
                        //TransferOutDetailsId = detail.Id,
                        CreatedById = request.CreatedById,
                        CreatedAtUtc = DateTime.UtcNow
                    };
                    await _attrRepository.CreateAsync(attr, cancellationToken);

                    if (inventoryTransaction.InventoryTransactionAttributesDetails == null)
                        inventoryTransaction.InventoryTransactionAttributesDetails = new List<InventoryTransactionAttributesDetails>();

                    inventoryTransaction.InventoryTransactionAttributesDetails.Add(attr);
                }

            }

            // Step 5: Save all inventory transactions
            await _unitOfWork.SaveAsync(cancellationToken);


            return new CreateTransferOutWithInventoryResult
            {
                Data = transferOut,
                InventoryTransactionData = inventoryTransactions
            };
        }
        catch(Exception ex)
        {
            // Since explicit transaction management is not available, rely on SaveAsync for atomicity
            throw; // Let the exception bubble up to be handled by the caller
        }
    }
}
