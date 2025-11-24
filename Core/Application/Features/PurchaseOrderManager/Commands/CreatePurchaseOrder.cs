using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.InventoryTransactionManager;
using Application.Features.NumberSequenceManager;
using Domain.Entities;
using Domain.Enums;
using FluentValidation;
using MediatR;

namespace Application.Features.PurchaseOrderManager.Commands;

public class CreatePurchaseOrderResult
{
    public PurchaseOrder? Data { get; set; }
}

public class CreatePurchaseOrderRequest : IRequest<CreatePurchaseOrderResult>
{
    public DateTime? OrderDate { get; init; }
    public string? OrderStatus { get; init; }
    public string? Description { get; init; }
    public string? VendorId { get; init; }
    public string? CreatedById { get; init; }
    public string? LocationId { get; init; }
    public double? BeforeTaxAmount { get; init; }
    public double? TaxAmount { get; init; }
    public double? AfterTaxAmount { get; init; }
    public List<PurchaseOrderItem>? Items { get; set; } = new();


}


public class CreatePurchaseOrderValidator : AbstractValidator<CreatePurchaseOrderRequest>
{
    public CreatePurchaseOrderValidator()
    {
        // --- Header / Master Validation ---
        RuleFor(x => x.OrderDate)
            .NotEmpty().WithMessage("Order date is required.");

        RuleFor(x => x.OrderStatus)
            .NotEmpty().WithMessage("Order status is required.");

        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("Vendor is required.");

        RuleFor(x => x.CreatedById)
            .NotEmpty().WithMessage("Created by user ID is required.");

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
    public class PurchaseOrderItemValidator : AbstractValidator<PurchaseOrderItem>
    {
        public PurchaseOrderItemValidator()
        {
            RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("Product is required.");

            RuleFor(i => i.UnitPrice)
                .GreaterThan(0).WithMessage("Unit price must be greater than zero.");
            
            RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            RuleFor(i => i.Total)
                .GreaterThanOrEqualTo(0).WithMessage("Total amount cannot be negative.");

            RuleFor(i => i.TotalAfterTax)
                .GreaterThanOrEqualTo(0).WithMessage("Total after tax cannot be negative.");

            RuleFor(i => i.TaxAmount)
                .GreaterThanOrEqualTo(0).When(i => i.TaxAmount.HasValue)
                .WithMessage("Tax amount cannot be negative.");
        }
    }

}

public class CreatePurchaseOrderHandler : IRequestHandler<CreatePurchaseOrderRequest, CreatePurchaseOrderResult>
{
    private readonly ICommandRepository<PurchaseOrder> _repository;
    private readonly ICommandRepository<PurchaseOrderItem> _itemRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly NumberSequenceService _numberSequenceService;
    private readonly PurchaseOrderService _purchaseOrderService;
    private readonly ISecurityService _securityService;

    public CreatePurchaseOrderHandler(
        ICommandRepository<PurchaseOrder> repository,
        IUnitOfWork unitOfWork,
        NumberSequenceService numberSequenceService,
        PurchaseOrderService purchaseOrderService,
        ISecurityService securityService,
        ICommandRepository<PurchaseOrderItem> itemRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _numberSequenceService = numberSequenceService;
        _purchaseOrderService = purchaseOrderService;
        _securityService = securityService;
        _itemRepository = itemRepository;
    }

    public async Task<CreatePurchaseOrderResult> Handle(CreatePurchaseOrderRequest request,
        CancellationToken cancellationToken)
    {
        var entity = new PurchaseOrder
        {
            CreatedById = request.CreatedById,
            Number = _numberSequenceService.GenerateNumber(nameof(PurchaseOrder), "", "PO"),
            OrderDate = _securityService.ConvertToIst(request.OrderDate),
            OrderStatus = (PurchaseOrderStatus)int.Parse(request.OrderStatus!),
            Description = request.Description,
            VendorId = request.VendorId,
            LocationId = request.LocationId,
            BeforeTaxAmount = request.BeforeTaxAmount,
            TaxAmount = request.TaxAmount,
            AfterTaxAmount = request.AfterTaxAmount
        };

        await _repository.CreateAsync(entity, cancellationToken);

        // ✔ Move SaveAsync AFTER items added
        foreach (var item in request.Items)
        {
            var itemEntity = new PurchaseOrderItem
            {
                CreatedById = request.CreatedById,
                PurchaseOrderId = entity.Id,
                ProductId = item.ProductId,
                Summary = item.Summary,
                UnitPrice = item.UnitPrice,
                Quantity = item.Quantity,
                TaxId = item.TaxId,
                TaxAmount = item.TaxAmount,
                TotalAfterTax = item.TotalAfterTax,
                Total = item.Total,

                // ✔ NEW ADDITIONS
                Attribute1DetailId = item.Attribute1DetailId,
                Attribute2DetailId = item.Attribute2DetailId
            };

            await _itemRepository.CreateAsync(itemEntity, cancellationToken);
        }

        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreatePurchaseOrderResult { Data = entity };
    }
}
