using Application.Common.Services.SecurityManager;
using FluentValidation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.SecurityManager.Queries
{
    public class GetUserWarehouseListResult
    {
        public List<GetUserLocationsListDto>? Data { get; init; }
    }
    public class GetUserWarehouseListRequest : IRequest<GetUserWarehouseListResult>
    {
        public string? UserId { get; init; }
    }
    public class GetUserWarehouseListValidator : AbstractValidator<GetUserWarehouseListRequest>
    {
        public GetUserWarehouseListValidator()
        {
            // No rules required (same as GetUserList)
        }
    }
    public class GetUserWarehouseListHandler
        : IRequestHandler<GetUserWarehouseListRequest, GetUserWarehouseListResult>
    {
        private readonly ISecurityService _securityService;

        public GetUserWarehouseListHandler(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        public async Task<GetUserWarehouseListResult> Handle(
            GetUserWarehouseListRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _securityService.GetUserLocationListAsync(request,cancellationToken);

            return new GetUserWarehouseListResult
            {
                Data = result
            };
        }
    }

}
