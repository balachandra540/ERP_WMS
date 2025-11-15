using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Attribute = Domain.Entities.Attribute;

namespace Application.Features.AttributeManager.Queries;

#region DTO

public record GetAttributeListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}

#endregion

#region Mapper Profile

public class GetAttributeListProfile : Profile
{
    public GetAttributeListProfile()
    {
        CreateMap<Attribute, GetAttributeListDto>();
    }
}

#endregion

#region Result & Request

public class GetAttributeListResult
{
    public List<GetAttributeListDto>? Data { get; init; }
}

public class GetAttributeListRequest : IRequest<GetAttributeListResult>
{
    public bool IsDeleted { get; init; } = false;
}

#endregion

#region Handler

public class GetAttributeListHandler : IRequestHandler<GetAttributeListRequest, GetAttributeListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetAttributeListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetAttributeListResult> Handle(GetAttributeListRequest request, CancellationToken cancellationToken)
    {
        var query = _context
            .Attribute
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .OrderByDescending(x => x.CreatedAtUtc)
            .AsQueryable();

        var entities = await query.ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<GetAttributeListDto>>(entities);

        return new GetAttributeListResult
        {
            Data = dtos
        };
    }
}

#endregion
