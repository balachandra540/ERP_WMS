using Application.Common.CQS.Queries;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq; // Ensure this is included for the .Where inside Include

namespace Application.Features.ProductManager.Queries;

#region ===== RESULT =====

public class GetProductDiscountDefinitionListResult
{
    // The collection will now contain the filtered ProductDiscountDetails list
    public List<ProductDiscountDefinition>? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class GetProductDiscountDefinitionListRequest
    : IRequest<GetProductDiscountDefinitionListResult>
{
}

#endregion

#region ===== HANDLER =====

public class GetProductDiscountDefinitionListHandler
    : IRequestHandler<GetProductDiscountDefinitionListRequest, GetProductDiscountDefinitionListResult>
{
    private readonly IQueryContext _context;

    public GetProductDiscountDefinitionListHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetProductDiscountDefinitionListResult> Handle(
        GetProductDiscountDefinitionListRequest request,
        CancellationToken cancellationToken)
    {
        // Use Filtered Include to ensure only non-deleted details are fetched
        var items = await _context.ProductDiscountDefinition
            .Include(x => x.ProductDiscountDetails.Where(d => !d.IsDeleted)) // ✅ Fix: Filters the child collection
            .Where(x => !x.IsDeleted) // Filters the parent entities
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return new GetProductDiscountDefinitionListResult
        {
            Data = items
        };
    }
}

#endregion