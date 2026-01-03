using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace Application.Features.ScrappingManager.Commands;

public class UpdateScrappingResult
{
    public Scrapping? Data { get; set; }
}

public class UpdateScrappingRequest : IRequest<UpdateScrappingResult>
{
    public string? Id { get; init; }
    public DateTime? ScrappingDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? WarehouseId { get; init; }
    public string? UpdatedById { get; init; }
    public List<ScrappedItems> Items { get; init; } = new();

}

public class UpdateScrappingValidator : AbstractValidator<UpdateScrappingRequest>
{
    public UpdateScrappingValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ScrappingDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
    }
}
public class UpdateScrappingHandler
    : IRequestHandler<UpdateScrappingRequest, UpdateScrappingResult>
{
    private readonly ICommandRepository<Scrapping> _repository;
    private readonly ICommandRepository<InventoryTransactionAttributesDetails> _attrRepository;
    private readonly IQueryContext _queryContext;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityService;

    public UpdateScrappingHandler(
        ICommandRepository<Scrapping> repository,
        ICommandRepository<InventoryTransactionAttributesDetails> attrRepository,
        IQueryContext queryContext,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
        ISecurityService securityService)
    {
        _repository = repository;
        _attrRepository = attrRepository;
        _queryContext = queryContext;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityService = securityService;
    }

    public async Task<UpdateScrappingResult> Handle(
        UpdateScrappingRequest request,
        CancellationToken cancellationToken)
    {
        // -----------------------------
        // 1️⃣ Fetch Scrapping
        // -----------------------------
        var entity = await _repository.GetAsync(request.Id!, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Scrapping not found: {request.Id}");

        // -----------------------------
        // 2️⃣ Update Header
        // -----------------------------
        entity.ScrappingDate = _securityService.ConvertToIst(request.ScrappingDate);
        entity.Status = Enum.Parse<ScrappingStatus>(request.Status!, true);
        entity.Description = request.Description;
        entity.WarehouseId = request.WarehouseId;
        entity.UpdatedById = request.UpdatedById;

        _repository.Update(entity);

        // -----------------------------
        // 3️⃣ Handle Items → Inventory
        // -----------------------------
        foreach (var item in request.Items)
        {
            // Create or update InventoryTransaction
            var inventoryTx =
                await _inventoryTransactionService.ScrappingUpdateInvenTrans(
                    item.Id,
                    item.ProductId!,
                    item.Movement ?? 0,
                    request.UpdatedById!,
                    cancellationToken);

            // -----------------------------
            // 4️⃣ Handle Attributes (IMEI / ServiceNo)
            // -----------------------------
            foreach (var detail in item.Attributes)
            {
                var goodsReceiveDetail =
                    await _queryContext.GoodsReceiveItemDetails
                        .AsNoTracking()
                        .Where(x =>
                            !x.IsDeleted &&
                            (
                                (!string.IsNullOrEmpty(detail.IMEI1) && x.IMEI1 == detail.IMEI1) ||
                                (!string.IsNullOrEmpty(detail.IMEI2) && x.IMEI2 == detail.IMEI2) ||
                                (!string.IsNullOrEmpty(detail.ServiceNo) && x.ServiceNo == detail.ServiceNo)
                            ))
                        .FirstOrDefaultAsync(cancellationToken);

                if (goodsReceiveDetail == null)
                {
                    throw new Exception(
                        $"GoodsReceive item not found. " +
                        $"IMEI1:{detail.IMEI1}, IMEI2:{detail.IMEI2}, ServiceNo:{detail.ServiceNo}");
                }

                // Prevent duplicate attribute insert
                var attrExists =
                    await _queryContext.InventoryTransactionAttributesDetails
                        .AnyAsync(x =>
                            x.InventoryTransactionId == inventoryTx.Id &&
                            x.GoodsReceiveItemDetailsId == goodsReceiveDetail.Id &&
                            !x.IsDeleted,
                            cancellationToken);

                if (!attrExists)
                {
                    await _attrRepository.CreateAsync(
                        new InventoryTransactionAttributesDetails
                        {
                            InventoryTransactionId = inventoryTx.Id,
                            GoodsReceiveItemDetailsId = goodsReceiveDetail.Id,
                            CreatedById = request.UpdatedById,
                            CreatedAtUtc = DateTime.UtcNow
                        },
                        cancellationToken);
                }
            }
        }

        // -----------------------------
        // 5️⃣ Save Once
        // -----------------------------
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateScrappingResult
        {
            Data = entity
        };
    }
}

//public class UpdateScrappingHandler : IRequestHandler<UpdateScrappingRequest, UpdateScrappingResult>
//{
//    private readonly ICommandRepository<Scrapping> _repository;
//    private readonly IUnitOfWork _unitOfWork;
//    private readonly InventoryTransactionService _inventoryTransactionService;
//    private readonly ISecurityService _securityService;

//    public UpdateScrappingHandler(
//        ICommandRepository<Scrapping> repository,
//        IUnitOfWork unitOfWork,
//        InventoryTransactionService inventoryTransactionService,
//       ISecurityService securityService

//        )
//    {
//        _repository = repository;
//        _unitOfWork = unitOfWork;
//        _inventoryTransactionService = inventoryTransactionService;
//        _securityService = securityService;
//    }

//    public async Task<UpdateScrappingResult> Handle(UpdateScrappingRequest request, CancellationToken cancellationToken)
//    {

//        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

//        if (entity == null)
//        {
//            throw new Exception($"Entity not found: {request.Id}");
//        }

//        entity.UpdatedById = request.UpdatedById;

//        entity.ScrappingDate = _securityService.ConvertToIst(request.ScrappingDate);
//        entity.Status = (ScrappingStatus)int.Parse(request.Status!);
//        entity.Description = request.Description;
//        entity.WarehouseId = request.WarehouseId;

//        _repository.Update(entity);
//        await _unitOfWork.SaveAsync(cancellationToken);

//        await _inventoryTransactionService.PropagateParentUpdate(
//            entity.Id,
//            nameof(Scrapping),
//            entity.ScrappingDate,
//            (InventoryTransactionStatus?)entity.Status,
//            entity.IsDeleted,
//            entity.UpdatedById,
//            entity.WarehouseId,
//            cancellationToken
//            );

//        return new UpdateScrappingResult
//        {
//            Data = entity
//        };
//    }
//}

