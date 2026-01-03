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
namespace Application.Features.ScrappingManager.Commands;

public class CreateScrappingResult
{
    public Scrapping? Data { get; set; }
}

public class CreateScrappingRequest : IRequest<CreateScrappingResult>
{
    public DateTime? ScrappingDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? WarehouseId { get; init; }
    public string? CreatedById { get; init; }
    public List<ScrappedItems> Items { get; init; } = new();

}
public class ScrappedItems
{
    public string? Id { get; init; }
    public int? PluCode { get; init; }
    public string? ProductId { get; init; }
    public int? Movement { get; init; }
    public List<ScrappedItemDetailDto> Attributes { get; init; } = new();

}
public class ScrappedItemDetailDto
{
    public int RowIndex { get; init; }
    public string? IMEI1 { get; init; }
    public string? IMEI2 { get; init; }
    public string? ServiceNo { get; init; }
}
public class CreateScrappingValidator : AbstractValidator<CreateScrappingRequest>
{
    public CreateScrappingValidator()
    {
        RuleFor(x => x.ScrappingDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
    }
}

public class CreateScrappingHandler : IRequestHandler<CreateScrappingRequest, CreateScrappingResult>
{
    private readonly ICommandRepository<Scrapping> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly ISecurityService _securityService;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _inventoryTransAttrRepository;
    //private readonly ICommandRepository<InventoryTransaction> _inventoryRepository;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly IQueryContext _queryContext;
    public CreateScrappingHandler(
        ICommandRepository<Scrapping> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        ISecurityService securityService,
        ICommandRepository<InventoryTransactionAttributesDetails> inventoryTransAttrRepository,
        IQueryContext queryContext,
        InventoryTransactionService inventoryTransactionService

        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _securityService = securityService;
        _queryContext = queryContext;
        _inventoryTransAttrRepository = inventoryTransAttrRepository;
        _inventoryTransactionService = inventoryTransactionService;
    }
    public async Task<CreateScrappingResult> Handle(CreateScrappingRequest request, CancellationToken cancellationToken = default)
    {
        // ---------------------------------------------------------
        // CREATE SCRAPPING
        // ---------------------------------------------------------
        var entity = new Scrapping
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(nameof(Scrapping), "", "SCRP"),
            ScrappingDate = _securityService.ConvertToIst(request.ScrappingDate),
            Status = (ScrappingStatus)int.Parse(request.Status!),
            Description = request.Description,
            WarehouseId = request.WarehouseId
        };

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        // ---------------------------------------------------------
        // CREATE SCRAPPING ITEMS + INVENTORY
        // ---------------------------------------------------------
        foreach (var dto in request.Items)
        {
            // -----------------------------
            // 1️⃣ CREATE INVENTORY TRANSACTION
            // -----------------------------
            var inventoryTx = await _inventoryTransactionService
                .ScrappingCreateInvenTrans(
                    entity.Id,
                    dto.ProductId!,
                    dto.Movement ?? 0,
                    request.CreatedById!,
                    cancellationToken
                );


            // -----------------------------
            // 2️⃣ ATTRIBUTE LEDGER (IMEI / SERVICE)
            // -----------------------------
            foreach (var detail in dto.Attributes)
            {
                // Find GoodsReceiveItemDetails
                var goodsReceiveDetail =
                    await _queryContext.GoodsReceiveItemDetails
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
                        $"IMEI1:{detail.IMEI1}, IMEI2:{detail.IMEI2}, ServiceNo:{detail.ServiceNo}");
                }

                await _inventoryTransAttrRepository.CreateAsync(
                    new InventoryTransactionAttributesDetails
                    {
                        InventoryTransactionId = inventoryTx.Id,
                        GoodsReceiveItemDetailsId = goodsReceiveDetail.Id,
                        CreatedById = request.CreatedById,
                        CreatedAtUtc = DateTime.UtcNow
                    },
                    cancellationToken
                );
            }
        }
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateScrappingResult
        {
            Data = entity
        };
    }
}
//    public async Task<CreateScrappingResult> Handle(CreateScrappingRequest request, CancellationToken cancellationToken = default)
//    {
//        var entity = new Scrapping();
//        entity.CreatedById = request.CreatedById;

//        entity.Number = _numberSequenceService.GenerateNumber(nameof(Scrapping), "", "SCRP");
//        entity.ScrappingDate = _securityService.ConvertToIst(request.ScrappingDate);
//        entity.Status = (ScrappingStatus)int.Parse(request.Status!);
//        entity.Description = request.Description;
//        entity.WarehouseId = request.WarehouseId;

//        await _repository.CreateAsync(entity, cancellationToken);
//        await _unitOfWork.SaveAsync(cancellationToken);

//        return new CreateScrappingResult
//        {
//            Data = entity
//        };
//    }
//}