using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Attribute = Domain.Entities.Attribute;

namespace Application.Features.AttributeManager.Queries;

#region DTOs
public record GetAttributeListDto
{
    public string? Id { get; init; }
    public string? Number { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}

public record GetAttributeDetailDto
{
    public string? Id { get; init; }
    public string? Value { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
}
#endregion

#region Mapper Profiles
public class GetAttributeListProfile : Profile
{
    public GetAttributeListProfile()
    {
        CreateMap<Attribute, GetAttributeListDto>();
    }
}

public class GetAttributeDetailsProfile : Profile
{
    public GetAttributeDetailsProfile()
    {
        CreateMap<AttributeDetail, GetAttributeDetailDto>();
    }
}
#endregion

#region Results & Requests
public class GetAttributeListResult
{
    public List<GetAttributeListDto>? Data { get; init; }
}

public class GetAttributeListRequest : IRequest<GetAttributeListResult>
{
    public bool IsDeleted { get; init; } = false;
}

public class GetAttributeDetailsResult
{
    public List<GetAttributeDetailDto>? Data { get; init; }
}

public class GetAttributeDetailsRequest : IRequest<GetAttributeDetailsResult>
{
    public string AttributeId { get; init; } = string.Empty;
    public bool IsDeleted { get; init; } = false;
}
#endregion

#region Handlers
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

public class GetAttributeDetailsHandler : IRequestHandler<GetAttributeDetailsRequest, GetAttributeDetailsResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetAttributeDetailsHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetAttributeDetailsResult> Handle(GetAttributeDetailsRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(request.AttributeId))
        {
            return new GetAttributeDetailsResult { Data = new List<GetAttributeDetailDto>() };
        }

        var query = _context
            .AttributeDetail
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .Where(x => x.AttributeId == request.AttributeId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .AsQueryable();

        var entities = await query.ToListAsync(cancellationToken);
        var dtos = _mapper.Map<List<GetAttributeDetailDto>>(entities);

        return new GetAttributeDetailsResult
        {
            Data = dtos
        };
    }
}
#endregion