using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.StockCountManager.Commands;

public class UpdateStockCountResult
{
    public StockCount? Data { get; set; }
}

public class UpdateStockCountRequest : IRequest<UpdateStockCountResult>
{
    public string? Id { get; init; }
    public DateTime? CountDate { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? WarehouseId { get; init; }
    public string? UpdatedById { get; init; }
}

public class UpdateStockCountValidator : AbstractValidator<UpdateStockCountRequest>
{
    public UpdateStockCountValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CountDate).NotEmpty();
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
    }
}

public class UpdateStockCountHandler : IRequestHandler<UpdateStockCountRequest, UpdateStockCountResult>
{
    private readonly ICommandRepository<StockCount> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly InventoryTransactionService _inventoryTransactionService;
    private readonly ISecurityService _securityservice;

    
    public UpdateStockCountHandler(
        ICommandRepository<StockCount> repository,
        IUnitOfWork unitOfWork,
        InventoryTransactionService inventoryTransactionService,
               ISecurityService securityService
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _inventoryTransactionService = inventoryTransactionService;
        _securityservice = securityService;
    }

    public async Task<UpdateStockCountResult> Handle(UpdateStockCountRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.UpdatedById;

        entity.CountDate = _securityservice.ConvertToIst(request.CountDate);
        entity.Status = (StockCountStatus)int.Parse(request.Status!);
        entity.Description = request.Description;
        entity.WarehouseId = request.WarehouseId;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        await _inventoryTransactionService.PropagateParentUpdate(
            entity.Id,
            nameof(StockCount),
            entity.CountDate,
            (InventoryTransactionStatus?)entity.Status,
            entity.IsDeleted,
            entity.UpdatedById,
            entity.WarehouseId,
            cancellationToken
            );

        return new UpdateStockCountResult
        {
            Data = entity
        };
    }
}

