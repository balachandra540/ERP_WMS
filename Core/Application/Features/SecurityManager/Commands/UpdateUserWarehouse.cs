using Application.Common.Services.SecurityManager;
using FluentValidation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.SecurityManager.Commands
{
    public class UpdateUserWarehouseResult
    {
        public UpdateUserLocationsListDto? Data { get; set; }
    }
    public class UpdateUserWarehouseRequest : IRequest<UpdateUserWarehouseResult>
    {
        public string? Id { get; init; }
        public string? WarehouseId { get; init; }
        public bool IsDefaultLocation { get; init; }  // 🔥 ADD

        public string? UpdatedById { get; init; }
    }
    public class UpdateUserWarehouseValidator : AbstractValidator<UpdateUserWarehouseRequest>
    {
        public UpdateUserWarehouseValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
            RuleFor(x => x.WarehouseId).NotEmpty();
        }
    }
    public class UpdateUserWarehouseHandler
    : IRequestHandler<UpdateUserWarehouseRequest, UpdateUserWarehouseResult>
    {
        private readonly ISecurityService _securityService;

        public UpdateUserWarehouseHandler(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        public async Task<UpdateUserWarehouseResult> Handle(
            UpdateUserWarehouseRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _securityService.UpdateUserWarehouseAsync(
                request.Id ?? "",
                request.WarehouseId ?? "",
                request.IsDefaultLocation,
                request.UpdatedById ?? "",
                cancellationToken);

            return new UpdateUserWarehouseResult
            {
                Data = result
            };
        }
    }

}
