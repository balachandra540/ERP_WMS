using Application.Common.Extensions;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.TransferInManager.Commands;

public class CreateTransferInResult
{
    public TransferIn? Data { get; set; }
    public List<InventoryTransaction> InventoryTransactionData { get; set; } = new List<InventoryTransaction>();
}

public class CreateTransferInRequest : IRequest<CreateTransferInResult>
{
    public DateTime? TransferReceiveDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? TransferOutId { get; init; }
    public string? CreatedById { get; init; }
    public List<InventoryItem> Items { get; init; } = new List<InventoryItem>();
}

public class InventoryItem
{
    public string? Id { get; init; }

    public string? ProductId { get; init; }
    public double? Movement { get; init; }
}

public class CreateTransferInValidator : AbstractValidator<CreateTransferInRequest>
{
    public CreateTransferInValidator()
    {
        RuleFor(x => x.TransferReceiveDate).NotEmpty().WithMessage("Transfer receive date is required.");
        RuleFor(x => x.Status).NotEmpty().WithMessage("Status is required.");
        RuleFor(x => x.TransferOutId).NotEmpty().WithMessage("TransferOut ID is required.");
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

public class CreateTransferInHandler : IRequestHandler<CreateTransferInRequest, CreateTransferInResult>
{
    private readonly ICommandRepository<TransferIn> _transferInRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public CreateTransferInHandler(
        ICommandRepository<TransferIn> transferInRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
         ISecurityService securityService
        )
    {
        _transferInRepository = transferInRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }


    public async Task<CreateTransferInResult> Handle(CreateTransferInRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            // Step 1: Create TransferIn
            var transferIn = new TransferIn
            {
                CreatedById = request.CreatedById,
                Number = _numberSequenceService.GenerateNumber(nameof(TransferIn), "", "IN"),
                TransferReceiveDate = _securityService.ConvertToIst(request.TransferReceiveDate),
                Status = (TransferStatus)int.Parse(request.Status!),
                Description = request.Description,
                TransferOutId = request.TransferOutId
            };

            await _transferInRepository.CreateAsync(transferIn, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            // Step 2: Create InventoryTransactions for each item
            var inventoryTransactions = new List<InventoryTransaction>();
            foreach (var item in request.Items)
            {
                // Check if the product is physical
                    var inventoryTransaction = await _inventoryTransactionService.TransferInCreateInvenTrans(
                        item.Id,
                        item.ProductId,
                        item.Movement,
                        request.CreatedById,
                        cancellationToken);

                    inventoryTransactions.Add(inventoryTransaction);
            }

            // Save all changes
            await _unitOfWork.SaveAsync(cancellationToken);

            return new CreateTransferInResult
            {
                Data = transferIn,
                InventoryTransactionData = inventoryTransactions
            };
        }
        catch
        {
            // Let the exception bubble up to be handled by the caller
            throw;
        }
    }
}