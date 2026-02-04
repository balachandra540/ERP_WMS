using Application.Common.CQS.Queries;
using Application.Common.Extensions; // Assuming this contains ApplyIsDeletedFilter
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Queries;

#region ===== RESULT =====

public class GetActiveProductDiscountDefinitionListResult
{
    // Ensure the entity includes the child collection ProductDiscountDetails
    public List<ProductDiscountDefinition>? Data { get; set; }
}

#endregion

#region ===== REQUEST =====

public class GetActiveProductDiscountDefinitionListRequest
    : IRequest<GetActiveProductDiscountDefinitionListResult>
{
}

#endregion

#region ===== HANDLER =====

public class GetActiveProductDiscountDefinitionListHandler
    : IRequestHandler<GetActiveProductDiscountDefinitionListRequest, GetActiveProductDiscountDefinitionListResult>
{
    private readonly IQueryContext _context;

    public GetActiveProductDiscountDefinitionListHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetActiveProductDiscountDefinitionListResult> Handle(
        GetActiveProductDiscountDefinitionListRequest request,
        CancellationToken cancellationToken)
    {
        // Get today's date at midnight for comparison
        var today = DateTime.UtcNow.Date;

        var items = await _context.ProductDiscountDefinition
            // 1. Include the User Group details for 'Upto' types
            .Include(x => x.ProductDiscountDetails.Where(d => !d.IsDeleted)) // ✅ Fix: Filters the child collection
            .Where(x => x.IsActive && !x.IsDeleted)
            // 2. Date Range Logic: Today must be between EffectiveFrom and EffectiveTo
            .Where(x => x.EffectiveFrom <= today && (x.EffectiveTo == null || x.EffectiveTo >= today))
            .OrderByDescending(x => x.EffectiveFrom)
            .ToListAsync(cancellationToken);

        return new GetActiveProductDiscountDefinitionListResult
        {
            Data = items
        };
    }
}

#endregion