using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

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
}

public class InventoryItem
{
    public string? Id { get; init; }
    public string? ProductId { get; init; }
    public double? Movement { get; init; }
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
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public UpdateTransferOutHandler(
        ICommandRepository<TransferOut> repository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<UpdateTransferOutResult> Handle(UpdateTransferOutRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate request explicitly
            var validator = new UpdateTransferOutValidator();
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                throw new ValidationException(validationResult.Errors);
            }

            var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);
            if (entity == null)
            {
                throw new KeyNotFoundException($"TransferOut entity not found: {request.Id}");
            }

            entity.UpdatedById = request.UpdatedById;
            entity.TransferReleaseDate = _securityService.ConvertToIst(request.TransferReleaseDate);
            entity.Status = Enum.TryParse<TransferStatus>(request.Status, true, out var status)
                ? status
                : throw new ArgumentException($"Invalid status value: {request.Status}");
            entity.Description = request.Description;
            entity.WarehouseFromId = request.WarehouseFromId;
            entity.WarehouseToId = request.WarehouseToId;

            _repository.Update(entity);

            foreach (var item in request.Items)
            {
                await _inventoryTransactionService.TransferOutUpdateInvenTrans(
                    item.Id,
                    item.ProductId,
                    item.Movement,
                    request.UpdatedById,
                    cancellationToken);
            }

            foreach (var item in request.DeletedItems)
            {
                await _inventoryTransactionService.TransferOutDeleteInvenTrans(
                    item.Id,
                    request.UpdatedById,
                    cancellationToken);
            }

            //await _inventoryTransactionService.PropagateParentUpdate(
            //    entity.Id,
            //    nameof(TransferOut),
            //    entity.TransferReleaseDate,
            //    (InventoryTransactionStatus?)entity.Status,
            //    entity.IsDeleted,
            //    entity.UpdatedById,
            //    entity.WarehouseFromId,
            //    cancellationToken);

            await _unitOfWork.SaveAsync(cancellationToken);

            return new UpdateTransferOutResult
            {
                Data = entity
            };
        }
        catch (ValidationException ex)
        {
            throw new Exception($"Validation failed: {string.Join(", ", ex.Errors.Select(e => e.ErrorMessage))}", ex);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to update TransferOut: {ex.Message}", ex);
        }
    }
}