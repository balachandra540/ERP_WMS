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

namespace Application.Features.PurchaseReturnManager.Commands;

public class CreatePurchaseReturnResult
{
    public PurchaseReturn? Data { get; set; }
}

public class PurchaseReturnItemDto
{
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }
    public double Movement { get; init; }
    public string? Summary { get; init; }
    public List<PurchaseReturnItemDetailDto> Attributes { get; init; } = new();
}

public class PurchaseReturnItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}



public class CreatePurchaseReturnRequest : IRequest<CreatePurchaseReturnResult>
{
    public DateTime? ReturnDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? GoodsReceiveId { get; init; }
    public string? CreatedById { get; init; }

    // 🔥 FROM FRONTEND GRID
    public List<PurchaseReturnItemDto> Items { get; init; } = new();
}



public class CreatePurchaseReturnValidator : AbstractValidator<CreatePurchaseReturnRequest>
{
    public CreatePurchaseReturnValidator()
    {
        RuleFor(x => x.ReturnDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.GoodsReceiveId).NotEmpty();

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



public class CreatePurchaseReturnHandler
    : IRequestHandler<CreatePurchaseReturnRequest, CreatePurchaseReturnResult>
{
    private readonly ICommandRepository<PurchaseReturn> _repository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrDetailsRepository;
    private readonly ICommandRepository<GoodsReceiveItemDetails> _goodsReceiveItemDetailsRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public CreatePurchaseReturnHandler(
        ICommandRepository<PurchaseReturn> repository,
        ICommandRepository<InventoryTransactionAttributesDetails> attrDetailsRepository,
        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService)
    {
        _repository = repository;
        _attrDetailsRepository = attrDetailsRepository;
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<CreatePurchaseReturnResult> Handle(
        CreatePurchaseReturnRequest request,
        CancellationToken cancellationToken)
    {
        // 🔹 1. CREATE HEADER
        var entity = new PurchaseReturn
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(
                nameof(PurchaseReturn), "", "PRN-"),
            ReturnDate = _securityService.ConvertToIst(request.ReturnDate),
            Status = (PurchaseReturnStatus)int.Parse(request.Status!),
            Description = request.Description,
            GoodsReceiveId = request.GoodsReceiveId
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // 🔹 2. PROCESS ITEMS
        foreach (var item in request.Items)
        {
            var inventoryTx =
                await _inventoryTransactionService.PurchaseReturnCreateInvenTrans(
                    entity.Id,
                    item.WarehouseId,
                    item.ProductId,
                    item.Movement,
                    request.CreatedById,
                    cancellationToken);

            // 🔹 3. HANDLE ATTRIBUTES (IMEI / SERVICE NO)
            if (item.Attributes != null && item.Attributes.Any())
            {
                foreach (var attr in item.Attributes)
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

                    var detail = new InventoryTransactionAttributesDetails
                    {
                        InventoryTransactionId = inventoryTx.Id,
                        GoodsReceiveItemDetailsId = goodsReceiveItemDetailId,
                        CreatedById = request.CreatedById,
                        CreatedAtUtc = DateTime.UtcNow
                    };

                    await _attrDetailsRepository.CreateAsync(detail, cancellationToken);
                }
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreatePurchaseReturnResult
        {
            Data = entity
        };
    }
}

