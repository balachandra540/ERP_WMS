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
using Microsoft.EntityFrameworkCore; // 🔥 Required for FirstOrDefaultAsync

namespace Application.Features.PositiveAdjustmentManager.Commands;

public class CreatePositiveAdjustmentResult
{
    public PositiveAdjustment? Data { get; set; }
}

public class PositiveAdjustmentItemDto
{
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }
    public double Movement { get; init; }
    public string? Summary { get; init; }
    public List<CreatePositiveAdjustmentItemDetailDto> Attributes { get; init; } = new();
}

public class CreatePositiveAdjustmentItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}

public class CreatePositiveAdjustmentRequest : IRequest<CreatePositiveAdjustmentResult>
{
    public DateTime? AdjustmentDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? CreatedById { get; init; }
    public List<PositiveAdjustmentItemDto> Items { get; init; } = new();
}

public class CreatePositiveAdjustmentValidator : AbstractValidator<CreatePositiveAdjustmentRequest>
{
    public CreatePositiveAdjustmentValidator()
    {
        RuleFor(x => x.AdjustmentDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("At least one item is required.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.WarehouseId).NotEmpty();
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Movement).GreaterThan(0);
        });
    }
}

public class CreatePositiveAdjustmentHandler : IRequestHandler<CreatePositiveAdjustmentRequest, CreatePositiveAdjustmentResult>
{
    private readonly ICommandRepository<PositiveAdjustment> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrDetailsRepository;
    private readonly ISecurityService _securityService;
    private readonly IQueryContext _queryContext;
    private readonly ICommandRepository<GoodsReceiveItemDetails> _goodsReceiveItemDetailsRepository;

    public CreatePositiveAdjustmentHandler(
        ICommandRepository<PositiveAdjustment> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        ICommandRepository<InventoryTransactionAttributesDetails> attrDetailsRepository,
        ISecurityService securityService,
        IQueryContext queryContext,
       ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository

        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _attrDetailsRepository = attrDetailsRepository;
        _securityService = securityService;
        _queryContext = queryContext;
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
    }

    public async Task<CreatePositiveAdjustmentResult> Handle(CreatePositiveAdjustmentRequest request, CancellationToken cancellationToken = default)
    {
        // 1. Create and Save Header with IST Conversion
        var entity = new PositiveAdjustment
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(nameof(PositiveAdjustment), "", "ADJ+"),
            AdjustmentDate = _securityService.ConvertToIst(request.AdjustmentDate),
            Status = (AdjustmentStatus)int.Parse(request.Status!),
            Description = request.Description
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // 2. Loop through Items and their specific attributes
        foreach (var itemDto in request.Items)
        {
            var inventoryTx = await _inventoryTransactionService.PositiveAdjustmentCreateInvenTrans(
                entity.Id,
                itemDto.WarehouseId,
                itemDto.ProductId,
                itemDto.Movement,
                request.CreatedById,
                cancellationToken);

            if (itemDto.Attributes != null && itemDto.Attributes.Any())
            {
                foreach (var attr in itemDto.Attributes)
                {
                    var query = _goodsReceiveItemDetailsRepository
     .GetQuery()
     .ApplyIsDeletedFilter(false);


                    if (!string.IsNullOrEmpty(attr.IMEI1))
                    {
                        query = query.Where(x => x.IMEI1 == attr.IMEI1);
                    }
                    else if (!string.IsNullOrEmpty(attr.IMEI2))
                    {
                        query = query.Where(x => x.IMEI2 == attr.IMEI2);
                    }
                    else if (!string.IsNullOrEmpty(attr.ServiceNo))
                    {
                        query = query.Where(x => x.ServiceNo == attr.ServiceNo);
                    }
                    else
                    {
                        throw new ValidationException(
                            $"No IMEI / ServiceNo provided at row {attr.RowIndex}"
                        );
                    }

                    var goodsReceiveItemDetailId = await query
                        .Select(x => x.Id)
                        .SingleOrDefaultAsync(cancellationToken);

                    if (string.IsNullOrEmpty(goodsReceiveItemDetailId))
                    {
                        throw new ValidationException(
                            $"IMEI / ServiceNo not found (RowIndex: {attr.RowIndex})"
                        );
                    }

                    // 4. Store the reference in the attribute ledger
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

        return new CreatePositiveAdjustmentResult { Data = entity };
    }
}