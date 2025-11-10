using Application.Common.CQS.Queries;
using AutoMapper;
using Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Application.Common.Extensions;


namespace Application.Features.ProductGroupAttributeManager.Queries
{
    // ✅ DTO
    public record GetProductGroupAttributeListDto
    {
        public string? Id { get; init; }
        public string? ProductGroupId { get; init; }
        public string? AttributeName { get; init; }
        public string? AttributeValue { get; init; }
        public string? CreatedBy { get; init; }
        public DateTime? CreatedDate { get; init; }
        public string? UpdatedBy { get; init; }
        public DateTime? UpdatedDate { get; init; }
    }

    // ✅ AutoMapper Profile
    public class GetProductGroupAttributeListProfile : Profile
    {
        public GetProductGroupAttributeListProfile()
        {
            CreateMap<ProductGroupAttributes, GetProductGroupAttributeListDto>();
        }
    }

    // ✅ Result
    public class GetProductGroupAttributeListResult
    {
        public List<GetProductGroupAttributeListDto>? Data { get; init; }
    }

    // ✅ Request
    public class GetProductGroupAttributeListRequest : IRequest<GetProductGroupAttributeListResult>
    {
        public string? ProductGroupId { get; init; }
        public bool IsDeleted { get; init; } = false;
    }

    // ✅ Handler
    public class GetProductGroupAttributeListHandler : IRequestHandler<GetProductGroupAttributeListRequest, GetProductGroupAttributeListResult>
    {
        private readonly IMapper _mapper;
        private readonly IQueryContext _context;

        public GetProductGroupAttributeListHandler(IMapper mapper, IQueryContext context)
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<GetProductGroupAttributeListResult> Handle(GetProductGroupAttributeListRequest request, CancellationToken cancellationToken)
        {
            var query = _context
                .ProductGroupAttributes
                .AsNoTracking()
                .ApplyIsDeletedFilter(request.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.ProductGroupId))
            {
                query = query.Where(x => x.ProductGroupId == request.ProductGroupId);
            }

            var entities = await query.ToListAsync(cancellationToken);
            var dtos = _mapper.Map<List<GetProductGroupAttributeListDto>>(entities);

            return new GetProductGroupAttributeListResult
            {
                Data = dtos
            };
        }
    }
}
