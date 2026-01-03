using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TransferOutManager.Commands;

public class UpdateTransferOutResult
{
    public TransferOut? Data { get; set; }
}

public class UpdateTransferOutRequest : IRequest<UpdateTransferOutResult>
{
    public string? Id { get; init; }
    public DateTime? TransferReleaseDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? WarehouseFromId { get; init; }
    public string? WarehouseToId { get; init; }
    public string? UpdatedById { get; init; }

    // ✅ SOLUTION: Non-nullable, required collections
    public List<InventoryItem> Items { get; init; } = new();
    public List<DeleteInventoryItem> DeletedItems { get; init; } = new();
    //public List<TransferOutDetails> TransferOutDetails { get; init; } = new();
}

public class InventoryItem
{
    public string? Id { get; init; }
    public string? ProductId { get; init; }
    public double? Movement { get; init; }
    public List<TransferOutDetailRequest> Details { get; init; } = new();
}

public class DeleteInventoryItem
{
    public string? Id { get; init; }
}

public class UpdateTransferOutValidator : AbstractValidator<UpdateTransferOutRequest>
{
    public UpdateTransferOutValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("TransferOut ID is required.");

        RuleFor(x => x.TransferReleaseDate)
            .NotEmpty().WithMessage("Transfer release date is required.")
            .Must(date => date != default(DateTime)).WithMessage("Invalid transfer release date.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(status => Enum.TryParse<TransferStatus>(status, true, out _))
            .WithMessage("Invalid status value. Must be a valid TransferStatus.");

        RuleFor(x => x.WarehouseFromId)
            .NotEmpty().WithMessage("Source warehouse ID is required.");

        RuleFor(x => x.WarehouseToId)
            .NotEmpty().WithMessage("Destination warehouse ID is required.")
            .Must((req, toId) => toId != req.WarehouseFromId)
            .WithMessage("Source and destination warehouses cannot be the same.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
            .When(x => x.Description != null);

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one inventory item is required.")
            .Must(items => items.All(item => !string.IsNullOrEmpty(item.ProductId) && item.Movement.HasValue && item.Movement > 0))
            .WithMessage("All items must have a valid ProductId and a positive Movement value.");

        RuleForEach(x => x.Items)
            .ChildRules(item =>
            {
                item.RuleFor(x => x.ProductId)
                    .NotEmpty().WithMessage("Product ID is required for each item.");
                item.RuleFor(x => x.Movement)
                    .NotNull().WithMessage("Movement is required for each item.")
                    .GreaterThan(0).WithMessage("Movement must be greater than 0 for each item.");
            });

        RuleForEach(x => x.DeletedItems)
            .ChildRules(item =>
            {
                item.RuleFor(x => x.Id)
                    .NotEmpty().WithMessage("Deleted item ID is required.");
            });
    }
}
public class UpdateTransferOutHandler : IRequestHandler<UpdateTransferOutRequest, UpdateTransferOutResult>
{
    private readonly ICommandRepository<TransferOut> _repository;
    private readonly ICommandRepository<TransferOutDetails> _transferOutDetailsRepository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;
    private readonly IQueryContext _queryContext;

    public UpdateTransferOutHandler(
        ICommandRepository<TransferOut> repository,
        ICommandRepository<TransferOutDetails> transferOutDetailsRepository,
       ICommandRepository<InventoryTransactionAttributesDetails> attrRepository,
    IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService,
        IQueryContext queryContext)
    {
        _repository = repository;
        _transferOutDetailsRepository = transferOutDetailsRepository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
        _attrRepository = attrRepository;
        _queryContext = queryContext;
    }

    public async Task<UpdateTransferOutResult> Handle(UpdateTransferOutRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // -----------------------------
            // 1️⃣ Fetch TransferOut
            // -----------------------------
            var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);
            if (entity == null)
                throw new KeyNotFoundException($"TransferOut not found: {request.Id}");

            // -----------------------------
            // 2️⃣ Update TransferOut header
            // -----------------------------
            entity.TransferReleaseDate = _securityService.ConvertToIst(request.TransferReleaseDate);
            entity.Status = Enum.Parse<TransferStatus>(request.Status!, true);
            entity.Description = request.Description;
            entity.WarehouseFromId = request.WarehouseFromId;
            entity.WarehouseToId = request.WarehouseToId;
            entity.UpdatedById = request.UpdatedById;

            _repository.Update(entity);

            // -----------------------------
            // 3️⃣ Handle InventoryItems & TransferOutDetails
            // -----------------------------
            foreach (var item in request.Items)
            {
                // Update or create InventoryTransaction
                var inventoryTransaction = await _inventoryTransactionService.TransferOutUpdateInvenTrans(
                    item.Id,
                    item.ProductId!,
                    item.Movement ?? 0,
                    request.UpdatedById!,
                    cancellationToken);

                foreach (var detail in item.Details)
                {
                    // Try fetch existing TransferOutDetail
                    //TransferOutDetails detail = null;

                    //if (!string.IsNullOrEmpty(detailRequest.Id))
                    //{
                    //    detail = await _transferOutDetailsRepository.GetAsync(detailRequest.Id!, cancellationToken);
                    //}

                    //if (detail != null)
                    //{
                    //    // Update existing detail
                    //    detail.IMEI1 = detailRequest.IMEI1;
                    //    detail.IMEI2 = detailRequest.IMEI2;
                    //    detail.ServiceNo = detailRequest.ServiceNo;
                    //    detail.UpdatedById = request.UpdatedById;
                    //    detail.UpdatedAtUtc = DateTime.UtcNow;

                    //    _transferOutDetailsRepository.Update(detail);
                    //}
                    //else
                    //{
                    //    // Create new detail
                    //    detail = new TransferOutDetails
                    //    {
                    //        //Id = Guid.NewGuid().ToString(),
                    //        TransferOutId = entity.Id,
                    //        RowIndex = detailRequest.RowIndex,
                    //        IMEI1 = detailRequest.IMEI1,
                    //        IMEI2 = detailRequest.IMEI2,
                    //        ServiceNo = detailRequest.ServiceNo,
                    //        CreatedById = request.UpdatedById,
                    //        CreatedAtUtc = DateTime.UtcNow
                    //    };

                    //    await _transferOutDetailsRepository.CreateAsync(detail, cancellationToken);
                    //}

                    // Link detail to InventoryTransactionAttributesDetails if not exists
                    //var attrExists = inventoryTransaction.InventoryTransactionAttributesDetails
                    //    .Any(a => a.TransferOutDetailsId == detail.Id);

                    //if (!attrExists)
                    //{
                    var goodsReceiveDetail = await _queryContext.GoodsReceiveItemDetails
                    .AsNoTracking()
                    .Where(x =>
                        !x.IsDeleted &&
                        (
                            (!string.IsNullOrEmpty(detail.IMEI1) && x.IMEI1 == detail.IMEI1) ||
                            (!string.IsNullOrEmpty(detail.IMEI2) && x.IMEI2 == detail.IMEI2) ||
                            (!string.IsNullOrEmpty(detail.ServiceNo) && x.ServiceNo == detail.ServiceNo)
                        )
                    )
                    .FirstOrDefaultAsync(cancellationToken);
                    if (goodsReceiveDetail == null)
                    {
                        throw new Exception(
                            $"GoodsReceive item not found. " +
                            $"IMEI1:{detail.IMEI1} , IMEI2: {detail.IMEI2} , ServiceNo: {detail.ServiceNo}");
                    }

                    if (inventoryTransaction.InventoryTransactionAttributesDetails == null)
                            inventoryTransaction.InventoryTransactionAttributesDetails = new List<InventoryTransactionAttributesDetails>();

                    
                    // PREVENT DUPLICATE INSERT
                    var attrExists = await _queryContext.InventoryTransactionAttributesDetails
                        .AnyAsync(x =>
                            x.InventoryTransactionId == inventoryTransaction.Id &&
                            x.GoodsReceiveItemDetailsId == goodsReceiveDetail.Id &&
                            !x.IsDeleted,
                            cancellationToken);

                    if (!attrExists)
                    {
                        var attr = new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTransaction.Id,
                            GoodsReceiveItemDetailsId = goodsReceiveDetail.Id,
                            CreatedById = request.UpdatedById,
                            CreatedAtUtc = DateTime.UtcNow
                        };

                        await _attrRepository.CreateAsync(attr, cancellationToken);
                        inventoryTransaction.InventoryTransactionAttributesDetails.Add(attr);

                    }


                    //}
                }
            }

            // -----------------------------
            // 4️⃣ Handle deleted items
            // -----------------------------
            foreach (var deletedItem in request.DeletedItems)
            {
                // Soft delete TransferOutDetail manually
                if (!string.IsNullOrEmpty(deletedItem.Id))
                {
                    var detail = await _transferOutDetailsRepository.GetAsync(deletedItem.Id, cancellationToken);
                    if (detail != null)
                    {
                        detail.IsDeleted = true;
                        detail.UpdatedById = request.UpdatedById;
                        detail.UpdatedAtUtc = DateTime.UtcNow;
                        _transferOutDetailsRepository.Update(detail);
                    }

                    // Delete linked InventoryTransaction
                    await _inventoryTransactionService.TransferOutDeleteInvenTrans(
                        deletedItem.Id!,
                        request.UpdatedById!,
                        cancellationToken);
                }
            }

            // -----------------------------
            // 5️⃣ Save all changes once
            // -----------------------------
            await _unitOfWork.SaveAsync(cancellationToken);

            return new UpdateTransferOutResult
            {
                Data = entity
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to update TransferOut: {ex.Message}", ex);
        }
    }
}

//public class UpdateTransferOutHandler : IRequestHandler<UpdateTransferOutRequest, UpdateTransferOutResult>
//{
//    private readonly ICommandRepository<TransferOut> _repository;
//    private readonly IUnitOfWork _unitOfWork;
//    private readonly InventoryTransactionService _inventoryTransactionService;
//    private readonly ISecurityService _securityService;
//    private readonly ICommandRepository<TransferOutDetails> _transferOutDetailsRepository;
//    public UpdateTransferOutHandler(
//        ICommandRepository<TransferOut> repository,
//        ICommandRepository<TransferOutDetails> transferOutDetailsRepository,
//        IUnitOfWork unitOfWork,
//        InventoryTransactionService inventoryTransactionService,
//        ISecurityService securityService)
//    {
//        _repository = repository;
//        _transferOutDetailsRepository = transferOutDetailsRepository;
//        _unitOfWork = unitOfWork;
//        _inventoryTransactionService = inventoryTransactionService;
//        _securityService = securityService;
//    }

//    public async Task<UpdateTransferOutResult> Handle(UpdateTransferOutRequest request, CancellationToken cancellationToken)
//    {
//        try
//        {
//            // Validate request explicitly
//            var validator = new UpdateTransferOutValidator();
//            var validationResult = await validator.ValidateAsync(request, cancellationToken);
//            if (!validationResult.IsValid)
//            {
//                throw new ValidationException(validationResult.Errors);
//            }

//            var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);
//            if (entity == null)
//            {
//                throw new KeyNotFoundException($"TransferOut entity not found: {request.Id}");
//            }

//            // Update header fields
//            entity.UpdatedById = request.UpdatedById;
//            entity.TransferReleaseDate = _securityService.ConvertToIst(request.TransferReleaseDate);
//            entity.Status = Enum.TryParse<TransferStatus>(request.Status, true, out var status)
//                ? status
//                : throw new ArgumentException($"Invalid status value: {request.Status}");
//            entity.Description = request.Description;
//            entity.WarehouseFromId = request.WarehouseFromId;
//            entity.WarehouseToId = request.WarehouseToId;

//            _repository.Update(entity);

//            // -----------------------------
//            // Step 1: Update or add TransferOutDetails
//            // -----------------------------
//            //var existingDetails = entity.TransferOutDetails ?? new List<TransferOutDetails>();
//            //int rowIndex = existingDetails.Count > 0 ? existingDetails.Max(d => d.RowIndex) + 1 : 0;

//            //if (entity.TransferOutDetails == null)
//            //{
//            //    entity.TransferOutDetails = new List<TransferOutDetails>();
//            //}

//            foreach (var item in request.Items) // assume each InventoryItem maps to one detail
//            {
//                // Check if the detail exists
//                //var transferDetail = existingDetails.FirstOrDefault(d => d.Id == detail.Id);
//                //if (transferDetail != null)
//                //{
//                //    // Update existing detail
//                //    transferDetail.UpdatedById = request.UpdatedById;
//                //    transferDetail.UpdatedAtUtc = DateTime.UtcNow;
//                //    // You can map additional fields if necessary (e.g., Quantity, IMEI)
//                //}
//                //else
//                //{
//                //    // Create new detail
//                //    transferDetail = new TransferOutDetails
//                //    {
//                //        Id = Guid.NewGuid().ToString(),
//                //        TransferOutId = entity.Id,
//                //        RowIndex = rowIndex++,
//                //        CreatedById = request.UpdatedById,
//                //        CreatedAtUtc = DateTime.UtcNow
//                //        // Map additional fields if available
//                //    };
//                //    entity.TransferOutDetails.Add(transferDetail);
//                //}

//                // -----------------------------
//                // Step 2: Create or update InventoryTransactionAttributesDetails with FK to TransferOutDetails
//                // -----------------------------
//                var inventoryTransaction = await _inventoryTransactionService.TransferOutUpdateInvenTrans(
//                    item.Id,
//                    item.ProductId,
//                    item.Movement,
//                    request.UpdatedById,
//                    cancellationToken
//                );
//                foreach (var d in item.Details)
//                {
//                    // Try find existing detail
//                    var detail = await _transferOutDetailsRepository.GetAsync(d.Id, cancellationToken);
//                    //var detail = await _transferOutDetailsRepository.GetAsync(x =>x.tra ==, cancellationToken);

//                    if (detail == null)
//                    {
//                        // CREATE
//                        detail = new TransferOutDetails
//                        {
//                            TransferOutId = entity.Id,
//                            RowIndex = d.RowIndex,
//                            IMEI1 = d.IMEI1,
//                            IMEI2 = d.IMEI2,
//                            ServiceNo = d.ServiceNo,
//                            CreatedById = request.UpdatedById,
//                            CreatedAtUtc = DateTime.UtcNow
//                        };

//                        await _transferOutDetailsRepository.CreateAsync(detail, cancellationToken);
//                    }
//                    else
//                    {
//                        // UPDATE
//                        detail.IMEI1 = d.IMEI1;
//                        detail.IMEI2 = d.IMEI2;
//                        detail.ServiceNo = d.ServiceNo;
//                        detail.UpdatedById = request.UpdatedById;
//                        detail.UpdatedAtUtc = DateTime.UtcNow;
//                    }

//                    // Link to inventory transaction (junction table)
//                    var attr = inventoryTransaction.InventoryTransactionAttributesDetails
//                        .FirstOrDefault(a => a.TransferOutDetailsId == detail.Id);

//                    if (attr == null)
//                    {
//                        inventoryTransaction.InventoryTransactionAttributesDetails.Add(
//                            new InventoryTransactionAttributesDetails
//                            {
//                                InventoryTransactionId = inventoryTransaction.Id,
//                                TransferOutDetailsId = detail.Id,
//                                CreatedById = request.UpdatedById,
//                                CreatedAtUtc = DateTime.UtcNow
//                            });
//                    }
//                }

//                // Check if an attribute record already exists
//                //var existingAttr = inventoryTransaction.InventoryTransactionAttributesDetails
//                //    .FirstOrDefault(a => a.TransferOutDetailsId == transferDetail.Id);

//                //if (existingAttr == null)
//                //{
//                //    var attr = new InventoryTransactionAttributesDetails
//                //    {
//                //        Id = Guid.NewGuid().ToString(),
//                //        InventoryTransactionId = inventoryTransaction.Id,
//                //        TransferOutDetailsId = transferDetail.Id, // ✅ NEW FK
//                //        CreatedById = request.UpdatedById,
//                //        CreatedAtUtc = DateTime.UtcNow
//                //    };
//                //    inventoryTransaction.InventoryTransactionAttributesDetails.Add(attr);
//                //}
//                //else
//                //{
//                //    existingAttr.UpdatedById = request.UpdatedById;
//                //    existingAttr.UpdatedAtUtc = DateTime.UtcNow;
//                //}
//            }

//            // -----------------------------
//            // Step 3: Delete removed items
//            // -----------------------------
//            //foreach (var deletedItem in request.DeletedItems)
//            //{
//            //    // Remove detail
//            //    var transferDetail = entity.TransferOutDetails.FirstOrDefault(d => d.Id == deletedItem.Id);
//            //    if (transferDetail != null)
//            //    {
//            //        transferDetail.IsDeleted = true;
//            //    }

//            //    // Delete InventoryTransaction
//            //    await _inventoryTransactionService.TransferOutDeleteInvenTrans(
//            //        deletedItem.Id,
//            //        request.UpdatedById,
//            //        cancellationToken
//            //    );
//            //}
//            foreach (var deleted in request.DeletedItems)
//            {
//                await _inventoryTransactionService.TransferOutDeleteInvenTrans(
//                    deleted.Id!,
//                    request.UpdatedById!,
//                    cancellationToken);

//                await _transferOutDetailsRepository.SoftDeleteAsync(
//                    deleted.Id!,
//                    request.UpdatedById!,
//                    cancellationToken);
//            }


//            // Save all changes
//            await _unitOfWork.SaveAsync(cancellationToken);

//            return new UpdateTransferOutResult
//            {
//                Data = entity
//            };
//        }
//        catch (ValidationException ex)
//        {
//            throw new Exception($"Validation failed: {string.Join(", ", ex.Errors.Select(e => e.ErrorMessage))}", ex);
//        }
//        catch (Exception ex)
//        {
//            throw new Exception($"Failed to update TransferOut: {ex.Message}", ex);
//        }
//    }
//}