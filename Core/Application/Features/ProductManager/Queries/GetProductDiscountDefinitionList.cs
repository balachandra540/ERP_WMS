using Application.Common.CQS.Queries;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Queries;

#region ===== RESULT =====

public class GetProductDiscountDefinitionListResult
{
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
        var items = await _context.ProductDiscountDefinition
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return new GetProductDiscountDefinitionListResult
        {
            Data = items
        };
    }
}

#endregion
