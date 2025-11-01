using Application.Common.CQS.Queries;
using Application.Common.Extensions;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.WarehouseManager.Queries;

public record GetWarehouseListDto
{
    public string? Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public bool? SystemWarehouse { get; init; }
    public DateTime? CreatedAtUtc { get; init; }
    public string? Currency { get; init; }
    public string? Street { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? ZipCode { get; init; }
    public string? Country { get; init; }
    public string? PhoneNumber { get; init; }
    public string? FaxNumber { get; init; }
    public string? EmailAddress { get; init; }
    public string? Type { get; init; }
    public string? GstNumber { get; init; }
    public string? Logo { get; init; }
}

public class GetWarehouseListProfile : Profile
{
    public GetWarehouseListProfile()
    {
        CreateMap<Warehouse, GetWarehouseListDto>();
    }
}

public class GetWarehouseListResult
{
    public List<GetWarehouseListDto>? Data { get; init; }
}

public class GetWarehouseListRequest : IRequest<GetWarehouseListResult>
{
    public bool IsDeleted { get; init; } = false;
    public string? wareHouseId { get; init; } = null;
}


public class GetWarehouseListHandler : IRequestHandler<GetWarehouseListRequest, GetWarehouseListResult>
{
    private readonly IMapper _mapper;
    private readonly IQueryContext _context;

    public GetWarehouseListHandler(IMapper mapper, IQueryContext context)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<GetWarehouseListResult> Handle(GetWarehouseListRequest request, CancellationToken cancellationToken)
    {
        var query = _context
            .Warehouse
            .AsNoTracking()
            .ApplyIsDeletedFilter(request.IsDeleted)
            .AsQueryable();

        // ✅ Apply location filter (through SalesOrder)
        if (request.wareHouseId != null && request.wareHouseId.Length > 0)
        {
            query = query.Where(x => x.Id != null && request.wareHouseId.Contains(x.Id!));
        }
        var entities = await query.ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<GetWarehouseListDto>>(entities);

        return new GetWarehouseListResult
        {
            Data = dtos
        };
    }


}



