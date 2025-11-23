using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Queries;

// Result Model (Active only)
public class GetActiveProductPriceListResult
{
    public List<ProductPriceDefinition>? Data { get; set; }
}

// Request (Active only)
public class GetActiveProductPriceListRequest
    : IRequest<GetActiveProductPriceListResult>
{
}

// Handler
public class GetActiveProductPriceListHandler
    : IRequestHandler<GetActiveProductPriceListRequest, GetActiveProductPriceListResult>
{
    private readonly IQueryContext _context;

    public GetActiveProductPriceListHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetActiveProductPriceListResult> Handle(
        GetActiveProductPriceListRequest request,
        CancellationToken cancellationToken)
    {
        var items = await _context.ProductPriceDefinition
            .Where(x => x.IsActive && !x.IsDeleted)
            .GroupBy(x => x.ProductId)
            .Select(g => g
                .OrderByDescending(x => x.EffectiveFrom)
                .FirstOrDefault())
            .OrderByDescending(x => x.EffectiveFrom)
            .ToListAsync(cancellationToken);

        return new GetActiveProductPriceListResult
        {
            Data = items
        };
    }
}
