using Application.Common.CQS.Queries;
using Application.Common.Repositories;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductManager.Queries;

public class GetProductPriceDefinitionListResult
{
    public List<ProductPriceDefinition>? Data { get; set; }
}

public class GetProductPriceDefinitionListRequest : IRequest<GetProductPriceDefinitionListResult>
{
}

public class GetProductPriceDefinitionListHandler :
    IRequestHandler<GetProductPriceDefinitionListRequest, GetProductPriceDefinitionListResult>
{
    private readonly IQueryContext _context;

    public GetProductPriceDefinitionListHandler(IQueryContext context)
    {
        _context = context;
    }

    public async Task<GetProductPriceDefinitionListResult> Handle(
        GetProductPriceDefinitionListRequest request,
        CancellationToken cancellationToken)
    {
        var items = await _context.ProductPriceDefinition
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return new GetProductPriceDefinitionListResult { Data = items };
    }
}
