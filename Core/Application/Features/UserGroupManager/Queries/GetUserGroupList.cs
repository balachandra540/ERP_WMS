using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.UserGroupManager.Queries;

#region ===== DTO =====

public record GetUserGroupListDto
{
    public string? Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }

    public bool IsActive { get; init; }                 // ✅

    public DateTime? CreatedAtUtc { get; init; }
}

#endregion

#region ===== MAPPING =====

public class GetUserGroupListProfile : Profile
{
    public GetUserGroupListProfile()
    {
        CreateMap<UserGroup, GetUserGroupListDto>();
    }
}

#endregion

#region ===== RESULT =====

public class GetUserGroupListResult
{
    public List<GetUserGroupListDto>? Data { get; init; }
}

#endregion

#region ===== REQUEST =====

public class GetUserGroupListRequest : IRequest<GetUserGroupListResult>
{
    public bool IsDeleted { get; init; } = false;
}

#endregion

#region ===== HANDLER =====

public class GetUserGroupListHandler
    : IRequestHandler<GetUserGroupListRequest, GetUserGroupListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetUserGroupListHandler(
        IMapper mapper,
        IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetUserGroupListResult> Handle(
        GetUserGroupListRequest request,
        CancellationToken cancellationToken)
    {
        var query = _context
            .UserGroup
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .AsQueryable();

        var entities = await query
            .ToListAsync(cancellationToken);

        var dtos = _mapper
            .Map<List<GetUserGroupListDto>>(entities);

        return new GetUserGroupListResult
        {
            Data = dtos
        };
    }
}

#endregion
