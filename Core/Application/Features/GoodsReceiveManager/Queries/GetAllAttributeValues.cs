using Application.Common.CQS.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.GoodsReceiveManager.Queries
{
    // -----------------------------------------------------
    // 1️⃣ DTO : Result data returned to frontend
    // -----------------------------------------------------
    public class GlobalAttributeValuesDto
    {
        public List<string> AllIMEI1 { get; set; } = new();
        public List<string> AllIMEI2 { get; set; } = new();
        public List<string> AllServiceNo { get; set; } = new();
    }


    // -----------------------------------------------------
    // 2️⃣ Query : MediatR request type
    // -----------------------------------------------------
    public class GetAllAttributeValuesQuery : IRequest<GlobalAttributeValuesDto>
    {
    }


    // -----------------------------------------------------
    // 3️⃣ Handler : Executes the logic
    // -----------------------------------------------------
    public class GetAllAttributeValuesHandler :
        IRequestHandler<GetAllAttributeValuesQuery, GlobalAttributeValuesDto>
    {
        private readonly IQueryContext _context;

        public GetAllAttributeValuesHandler(IQueryContext context)
        {
            _context = context;
        }


        public async Task<GlobalAttributeValuesDto> Handle(
            GetAllAttributeValuesQuery request,
            CancellationToken cancellationToken)
        {
            // Load all details from GoodsReceiveItemDetails
            var details = await _context.GoodsReceiveItemDetails
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .Select(x => new
                {
                    x.IMEI1,
                    x.IMEI2,
                    x.ServiceNo
                })
                .ToListAsync(cancellationToken);

            // Build final result
            var result = new GlobalAttributeValuesDto
            {
                AllIMEI1 = details
                    .Where(x => !string.IsNullOrWhiteSpace(x.IMEI1))
                    .Select(x => x.IMEI1!)
                    .Distinct()
                    .ToList(),

                AllIMEI2 = details
                    .Where(x => !string.IsNullOrWhiteSpace(x.IMEI2))
                    .Select(x => x.IMEI2!)
                    .Distinct()
                    .ToList(),

                AllServiceNo = details
                    .Where(x => !string.IsNullOrWhiteSpace(x.ServiceNo))
                    .Select(x => x.ServiceNo!)
                    .Distinct()
                    .ToList()
            };

            return result;
        }
    }
}
