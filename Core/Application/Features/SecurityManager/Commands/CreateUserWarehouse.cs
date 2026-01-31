using Application.Common.CQS.Commands;
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
    public class CreateUserWarehouseResult
    {
        public CreateUserLocationsListDto? Data { get; set; }
    }


    public class CreateUserWarehouseRequest : IRequest<CreateUserWarehouseResult>
    {
        public string? UserId { get; init; }
        public string? WarehouseId { get; init; }
        public bool IsDefaultLocation { get; init; }  // 🔥 ADD

        public string? CreatedById { get; init; }
    }
    public class CreateUserWarehouseValidator : AbstractValidator<CreateUserWarehouseRequest>
    {
        public CreateUserWarehouseValidator()
        {
            RuleFor(x => x.UserId).NotEmpty();
            RuleFor(x => x.WarehouseId).NotEmpty();
        }
    }


    public class CreateUserWarehouseHandler
        : IRequestHandler<CreateUserWarehouseRequest, CreateUserWarehouseResult>
    {
        private readonly ISecurityService _securityService;

        public CreateUserWarehouseHandler(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        public async Task<CreateUserWarehouseResult> Handle(
            CreateUserWarehouseRequest request,
            CancellationToken cancellationToken)
        {
            var result = await _securityService.CreateUserWarehouseAsync(
                request.UserId ?? "",
                request.WarehouseId ?? "",
                request.IsDefaultLocation,
                request.CreatedById ?? "",
                cancellationToken);

            return new CreateUserWarehouseResult
            {
                Data = result
            };
        }
    }

}
