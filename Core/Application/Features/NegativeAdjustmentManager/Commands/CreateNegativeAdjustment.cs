using Application.Common.CQS.Queries;
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

namespace Application.Features.NegativeAdjustmentManager.Commands;

public class CreateNegativeAdjustmentResult
{
    public NegativeAdjustment? Data { get; set; }
}

public class NegativeAdjustmentItemDto
{
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }
    public double Movement { get; init; }   // 🔻 Quantity to reduce
    public string? Summary { get; init; }
    public List<CreateNegativeAdjustmentItemDetailDto> Attributes { get; init; } = new();
}

public class CreateNegativeAdjustmentItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}

public class CreateNegativeAdjustmentRequest : IRequest<CreateNegativeAdjustmentResult>
{
    public DateTime? AdjustmentDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? CreatedById { get; init; }
    public List<NegativeAdjustmentItemDto> Items { get; init; } = new();
}

public class CreateNegativeAdjustmentValidator : AbstractValidator<CreateNegativeAdjustmentRequest>
{
    public CreateNegativeAdjustmentValidator()
    {
        RuleFor(x => x.AdjustmentDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
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


public class CreateNegativeAdjustmentHandler
    : IRequestHandler<CreateNegativeAdjustmentRequest, CreateNegativeAdjustmentResult>
{
    private readonly ICommandRepository<NegativeAdjustment> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrDetailsRepository;
    private readonly ISecurityService _securityService;
    private readonly ICommandRepository<GoodsReceiveItemDetails> _goodsReceiveItemDetailsRepository;

    public CreateNegativeAdjustmentHandler(
        ICommandRepository<NegativeAdjustment> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        ICommandRepository<InventoryTransactionAttributesDetails> attrDetailsRepository,
        ISecurityService securityService,
        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _attrDetailsRepository = attrDetailsRepository;
        _securityService = securityService;
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
    }

    public async Task<CreateNegativeAdjustmentResult> Handle(
        CreateNegativeAdjustmentRequest request,
        CancellationToken cancellationToken)
    {
        // 🔹 1. Create Header
        var entity = new NegativeAdjustment
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(
                nameof(NegativeAdjustment), "", "ADJ-"),
            AdjustmentDate = _securityService.ConvertToIst(request.AdjustmentDate),
            Status = (AdjustmentStatus)int.Parse(request.Status!),
            Description = request.Description
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // 🔹 2. Process Items
        foreach (var item in request.Items)
        {
            var inventoryTx =
                await _inventoryTransactionService.NegativeAdjustmentCreateInvenTrans(
                    entity.Id,
                    item.WarehouseId,
                    item.ProductId,
                    item.Movement,
                    request.CreatedById,
                    cancellationToken);

            // 🔹 3. Handle Attributes (IMEI / ServiceNo)
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

        return new CreateNegativeAdjustmentResult
        {
            Data = entity
        };
    }
}