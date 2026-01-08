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

namespace Application.Features.SalesReturnManager.Commands;

#region ===== DTOs =====

// 🔹 Attribute DTO (IMEI / ServiceNo)
public class CreateSalesReturnItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}

// 🔹 Item DTO from Vue Grid
public class CreateSalesReturnItemRequest
{
    public string? WarehouseId { get; init; }
    public string? ProductId { get; init; }

    // 🔥 returnQuantity
    public double Movement { get; init; }

    // 🔥 selected attributes only
    public List<CreateSalesReturnItemDetailDto> Attributes { get; init; } = new();
}

#endregion

#region ===== Request / Result =====

public class CreateSalesReturnResult
{
    public SalesReturn? Data { get; set; }
}

public class CreateSalesReturnRequest : IRequest<CreateSalesReturnResult>
{
    public DateTime? ReturnDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? DeliveryOrderId { get; init; }
    public string? CreatedById { get; init; }
    public List<CreateSalesReturnItemRequest> Items { get; init; } = new();
}

#endregion

#region ===== Validator =====

public class CreateSalesReturnValidator : AbstractValidator<CreateSalesReturnRequest>
{
    public CreateSalesReturnValidator()
    {
        RuleFor(x => x.ReturnDate).NotEmpty();
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

#endregion

#region ===== Handler =====

public class CreateSalesReturnHandler
    : IRequestHandler<CreateSalesReturnRequest, CreateSalesReturnResult>
{
    private readonly ICommandRepository<SalesReturn> _salesReturnRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    // 🔥 Attribute handling
    private readonly ICommandRepository<InventoryTransactionAttributesDetails>
        _attrDetailsRepository;

    private readonly ICommandRepository<GoodsReceiveItemDetails>
        _goodsReceiveItemDetailsRepository;

    public CreateSalesReturnHandler(
        ICommandRepository<SalesReturn> salesReturnRepository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService,
        ICommandRepository<InventoryTransactionAttributesDetails> attrDetailsRepository,
        ICommandRepository<GoodsReceiveItemDetails> goodsReceiveItemDetailsRepository)
    {
        _salesReturnRepository = salesReturnRepository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
        _attrDetailsRepository = attrDetailsRepository;
        _goodsReceiveItemDetailsRepository = goodsReceiveItemDetailsRepository;
    }

    public async Task<CreateSalesReturnResult> Handle(
        CreateSalesReturnRequest request,
        CancellationToken cancellationToken)
    {
        // 🔹 1. Create Sales Return Header
        var entity = new SalesReturn
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(
                nameof(SalesReturn), "", "SRN"),
            ReturnDate = _securityService.ConvertToIst(request.ReturnDate),
            Status = (SalesReturnStatus)int.Parse(request.Status!),
            Description = request.Description,
            DeliveryOrderId = request.DeliveryOrderId
        };

        await _salesReturnRepository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // 🔹 2. Process Items
        foreach (var item in request.Items)
        {
            var inventoryTx =
                await _inventoryTransactionService.SalesReturnCreateInvenTrans(
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

        return new CreateSalesReturnResult
        {
            Data = entity
        };
    }
}

#endregion
