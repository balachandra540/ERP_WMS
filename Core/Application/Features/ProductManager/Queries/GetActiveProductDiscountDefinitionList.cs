using Application.Common.CQS.Queries;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Queries;

#region ===== RESULT =====

public class GetActiveProductDiscountDefinitionListResult
{
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
        var items = await _context.ProductDiscountDefinition
            .Where(x => x.IsActive && !x.IsDeleted)
            .GroupBy(x => x.ProductId)
            .Select(g => g
                .OrderByDescending(x => x.EffectiveFrom)
                .FirstOrDefault())
            .OrderByDescending(x => x!.EffectiveFrom)
            .ToListAsync(cancellationToken);

        return new GetActiveProductDiscountDefinitionListResult
        {
            Data = items
        };
    }
}

#endregion
