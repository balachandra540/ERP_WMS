using Application.Common.Repositories;
using Domain.Entities;
using Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetPurchaseOrdersForDropdownQuery : IRequest<List<PurchaseOrderDto>>
{
    // Optional filters, e.g., only open POs
}

public class PurchaseOrderDto
{
    public string Id { get; set; }
    public string Number { get; set; }
    // Add other display fields if needed
}

public class GetPurchaseOrdersForDropdownHandler : IRequestHandler<GetPurchaseOrdersForDropdownQuery, List<PurchaseOrderDto>>
{
    private readonly ICommandRepository<PurchaseOrder> _repository;

    public GetPurchaseOrdersForDropdownHandler(ICommandRepository<PurchaseOrder> repository)
    {
        _repository = repository;
    }

    public async Task<List<PurchaseOrderDto>> Handle(GetPurchaseOrdersForDropdownQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetQuery()
            .Where(po => po.OrderStatus == PurchaseOrderStatus.Confirmed || po.OrderStatus == PurchaseOrderStatus.PartiallyReceived) // Only eligible POs
            .Select(po => new PurchaseOrderDto { Id = po.Id, Number = po.Number })
            .ToListAsync(cancellationToken);
    }
}