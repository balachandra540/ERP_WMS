using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.PurchaseOrderItemManager.Commands;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;
using static Application.Features.PurchaseOrderManager.Commands.CreatePurchaseOrderValidator;

namespace Application.Features.PurchaseOrderManager.Commands;

public class UpdatePurchaseOrderResult
{
    public PurchaseOrder? Data { get; set; }
}

public class UpdatePurchaseOrderRequest : IRequest<UpdatePurchaseOrderResult>
{
    public string? Id { get; init; }
    public DateTime? OrderDate { get; init; }
    public string? OrderStatus { get; init; }
    public string? Description { get; init; }
    public string? VendorId { get; init; }
    public string? TaxId { get; init; }
    public string? UpdatedById { get; init; }
    public string? LocationId { get; init; }
    public double? BeforeTaxAmount { get; init; }
    public double? TaxAmount { get; init; }
    public double? AfterTaxAmount { get; init; }
    public List<PurchaseOrderItem>? Items { get; set; } = new();
    public List<string>? DeletedItemIds { get; set; } = new();  // Just IDs
    public string? Attribute1DetailId { get; set; } // ✔ NEW
    public string? Attribute2DetailId { get; set; } // ✔ NEW


}


public class UpdatePurchaseOrderValidator : AbstractValidator<UpdatePurchaseOrderRequest>
{
    public UpdatePurchaseOrderValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        // --- Header / Master Validation ---
        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Order date is required.");

        RuleFor(x => x.OrderStatus)
            .NotEmpty().WithMessage("Order status is required.");

        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("Vendor is required.");

        RuleFor(x => x.UpdatedById)
            .NotEmpty().WithMessage("Updated by user ID is required.");

        RuleFor(x => x.LocationId)
            .NotEmpty().WithMessage("Location ID is required.");

        // --- Financial Fields ---
        RuleFor(x => x.BeforeTaxAmount)
            .GreaterThanOrEqualTo(0).WithMessage("Before tax amount cannot be negative.");

        RuleFor(x => x.TaxAmount)
            .GreaterThanOrEqualTo(0).When(x => x.TaxAmount.HasValue)
            .WithMessage("Tax amount cannot be negative.");

        RuleFor(x => x.AfterTaxAmount)
            .GreaterThanOrEqualTo(0).WithMessage("After tax amount cannot be negative.")
            .GreaterThanOrEqualTo(x => x.BeforeTaxAmount ?? 0)
            .WithMessage("After tax amount must be greater than or equal to before tax amount.");

        // --- Item List ---
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one purchase order item is required.");

        // Apply child validation to each item
        RuleForEach(x => x.Items)
            .SetValidator(new PurchaseOrderItemValidator());
    }
}

public class UpdatePurchaseOrderHandler : IRequestHandler<UpdatePurchaseOrderRequest, UpdatePurchaseOrderResult>
{
    private readonly ICommandRepository<PurchaseOrder> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly PurchaseOrderService _purchaseOrderService;
    private readonly ISecurityService _securityService;
    private readonly ICommandRepository<PurchaseOrderItem> _PurchaseOrderItemrepository;

    public UpdatePurchaseOrderHandler(
        ICommandRepository<PurchaseOrder> repository,
        IUnitOfWork unitOfWork,
        PurchaseOrderService purchaseOrderService,
       ISecurityService securityService,
        ICommandRepository<PurchaseOrderItem> PurchaseOrderItemrepository


        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _purchaseOrderService = purchaseOrderService;
        _securityService = securityService;
        _PurchaseOrderItemrepository = PurchaseOrderItemrepository;
    }

    public async Task<UpdatePurchaseOrderResult> Handle(UpdatePurchaseOrderRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        entity.UpdatedById = request.UpdatedById;

        entity.OrderDate = _securityService.ConvertToIst(request.OrderDate);

        entity.OrderStatus = (PurchaseOrderStatus)int.Parse(request.OrderStatus!);
        entity.Description = request.Description;
        entity.VendorId = request.VendorId;
        //entity.TaxId = request.TaxId;
        entity.LocationId = request.LocationId;
        entity.BeforeTaxAmount = request.BeforeTaxAmount;
        entity.TaxAmount = request.TaxAmount;
        entity.AfterTaxAmount = request.AfterTaxAmount;

        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        

        foreach (var item in request.Items)
        {
            if (string.IsNullOrEmpty(item.Id))
            {
                // NEW ITEM - Create
                var newPurchaseOrderItem = new PurchaseOrderItem
                {
                    PurchaseOrderId = entity.Id,
                    ProductId = item.ProductId,
                    Summary = item.Summary,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                    TaxId = item.TaxId,
                    TaxAmount = item.TaxAmount,
                    Total = item.Total,
                    TotalAfterTax = item.TotalAfterTax,
                    CreatedById = request.UpdatedById,
                    Attribute1DetailId=item.Attribute1DetailId,
                    Attribute2DetailId=item.Attribute2DetailId
                };
                await _PurchaseOrderItemrepository.CreateAsync(newPurchaseOrderItem, cancellationToken);
            }
            else
            {
                var PurchaseOrderItementity = new PurchaseOrderItem();
                PurchaseOrderItementity.UpdatedById = request.UpdatedById;

                PurchaseOrderItementity.PurchaseOrderId = entity.Id;
                PurchaseOrderItementity.Id = item.Id;
                PurchaseOrderItementity.ProductId = item.ProductId;
                PurchaseOrderItementity.Summary = item.Summary;
                PurchaseOrderItementity.UnitPrice = item.UnitPrice;
                PurchaseOrderItementity.Quantity = item.Quantity;
                PurchaseOrderItementity.TaxId = item.TaxId;
                PurchaseOrderItementity.TaxAmount = item.TaxAmount;
                PurchaseOrderItementity.TotalAfterTax = item.TotalAfterTax;
                PurchaseOrderItementity.TotalAfterTax = item.TotalAfterTax;
                PurchaseOrderItementity.Attribute1DetailId = item.Attribute1DetailId;
                PurchaseOrderItementity.Attribute2DetailId = item.Attribute2DetailId;

                PurchaseOrderItementity.Total = item.Total;

                _PurchaseOrderItemrepository.Update(PurchaseOrderItementity);

            }
        }

        // SAVE ONCE - Not in loop
        await _unitOfWork.SaveAsync(cancellationToken);

        foreach (var itemId in request.DeletedItemIds)
        {
            var deleteentity = await _PurchaseOrderItemrepository.GetAsync(itemId ?? string.Empty, cancellationToken);
            deleteentity.UpdatedById = request.UpdatedById;
            _PurchaseOrderItemrepository.Delete(deleteentity);
            await _unitOfWork.SaveAsync(cancellationToken);

        }
        return new UpdatePurchaseOrderResult
        {
            Data = entity
        };
    }
}

