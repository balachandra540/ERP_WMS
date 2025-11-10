using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductGroupAttributeValues.Queries;

// ===============================
// 🔹 DTO
// ===============================
public record GetProductGroupAttributeValueListDto
{
    public string? Id { get; init; }
    public string? AttributeId { get; init; }
    public string? ValueName { get; init; }
    public bool IsDeleted { get; init; }
    public DateTimeOffset? CreatedAtUtc { get; init; }
    public DateTimeOffset? UpdatedAtUtc { get; init; }
}

// ===============================
// 🔹 AutoMapper Profile
// ===============================
public class GetProductGroupAttributeValueListProfile : Profile
{
    public GetProductGroupAttributeValueListProfile()
    {
        CreateMap<ProductGroupAttributeValue, GetProductGroupAttributeValueListDto>();
    }
}

// ===============================
// 🔹 Result Wrapper
// ===============================
public class GetProductGroupAttributeValueListResult
{
    public List<GetProductGroupAttributeValueListDto>? Data { get; init; }
}

// ===============================
// 🔹 Request Object
// ===============================
public class GetProductGroupAttributeValueListRequest : IRequest<GetProductGroupAttributeValueListResult>
{
    public string? AttributeId { get; init; }
    public string? ProductGroupId { get; init; }
    public bool IsDeleted { get; init; } = false;
}

// ===============================
// 🔹 Handler Implementation
// ===============================
public class GetProductGroupAttributeValueListHandler : IRequestHandler<GetProductGroupAttributeValueListRequest, GetProductGroupAttributeValueListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetProductGroupAttributeValueListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetProductGroupAttributeValueListResult> Handle(GetProductGroupAttributeValueListRequest request, CancellationToken cancellationToken)
    {
        // Base query for values
        var query = _context
            .ProductGroupAttributeValues
            .AsNoTracking()
            .Include(v => v.Attribute)
            .ApplyIsDeletedFilter(request.IsDeleted)
            .AsQueryable();

        // ✅ Filter by AttributeId (direct child lookup)
        if (!string.IsNullOrEmpty(request.AttributeId))
        {
            query = query.Where(v => v.AttributeId == request.AttributeId);
        }

        // ✅ Optional: Filter by ProductGroupId (via Attribute)
        if (!string.IsNullOrEmpty(request.ProductGroupId))
        {
            query = query.Where(v => v.Attribute.ProductGroupId == request.ProductGroupId);
        }

        // ✅ Execute the query
        var entities = await query
            .OrderBy(v => v.ValueName)
            .ToListAsync(cancellationToken);

        // ✅ Map to DTOs
        var dtos = _mapper.Map<List<GetProductGroupAttributeValueListDto>>(entities);

        // ✅ Return result
        return new GetProductGroupAttributeValueListResult
        {
            Data = dtos
        };
    }
}
