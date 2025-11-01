using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.TransferOutManager.Commands;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.TransferInManager.Commands;

public class UpdateTransferInResult
{
    public TransferIn? Data { get; set; }
}

public class UpdateTransferInRequest : IRequest<UpdateTransferInResult>
{
    public string? Id { get; init; }
    public DateTime? TransferReceiveDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? TransferOutId { get; init; }
    public string? UpdatedById { get; init; }
    public List<InventoryItem> Items { get; init; } = new();
    public List<DeleteInventoryItem> DeletedItems { get; init; } = new();
}

public class UpdateTransferInValidator : AbstractValidator<UpdateTransferInRequest>
{
    public UpdateTransferInValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.TransferReceiveDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.TransferOutId).NotEmpty();

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

public class UpdateTransferInHandler : IRequestHandler<UpdateTransferInRequest, UpdateTransferInResult>
{
    private readonly ICommandRepository<TransferIn> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public UpdateTransferInHandler(
        ICommandRepository<TransferIn> repository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<UpdateTransferInResult> Handle(UpdateTransferInRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.UpdatedById;

        entity.TransferReceiveDate = _securityService.ConvertToIst(request.TransferReceiveDate);

        entity.Status = (TransferStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.TransferOutId = request.TransferOutId;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);
        // Step 2: Create InventoryTransactions for each item
        var inventoryTransactions = new List<InventoryTransaction>();
        foreach (var item in request.Items)
        {
            // Check if the product is physical
            var inventoryTransaction = await _inventoryTransactionService.TransferInUpdateInvenTrans(
                item.Id,
                item.ProductId,
                item.Movement,
                request.UpdatedById,
                cancellationToken);

            inventoryTransactions.Add(inventoryTransaction);
        }

        foreach (var item in request.DeletedItems)
        {
            await _inventoryTransactionService.TransferInDeleteInvenTrans(
                item.Id,
                request.UpdatedById,
                cancellationToken);
        }

        return new UpdateTransferInResult
        {
            Data = entity
        };
    }
}

