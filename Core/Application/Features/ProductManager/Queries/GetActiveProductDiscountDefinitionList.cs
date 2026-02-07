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
        // Fix: Convert UtcNow to Unspecified kind to satisfy 'timestamp without time zone'
        var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Unspecified);

        var items = await _context.ProductDiscountDefinition
            .Include(x => x.ProductDiscountDetails.Where(d => !d.IsDeleted))
            .Where(x => x.IsActive && !x.IsDeleted)
            .Where(x => x.EffectiveFrom <= today && (x.EffectiveTo == null || x.EffectiveTo >= today))
            .OrderByDescending(x => x.EffectiveFrom)
            .ToListAsync(cancellationToken);

        return new GetActiveProductDiscountDefinitionListResult { Data = items };
    }
}

#endregion