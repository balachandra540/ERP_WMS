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
    public class DeleteUserWarehouseResult
    {
        public bool Success { get; set; }
    }
    public class DeleteUserWarehouseRequest : IRequest<DeleteUserWarehouseResult>
    {
        public string? Id { get; init; }
        public string? DeletedById { get; init; }
    }
    public class DeleteUserWarehouseValidator : AbstractValidator<DeleteUserWarehouseRequest>
    {
        public DeleteUserWarehouseValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
    public class DeleteUserWarehouseHandler
        : IRequestHandler<DeleteUserWarehouseRequest, DeleteUserWarehouseResult>
    {
        private readonly ISecurityService _securityService;

        public DeleteUserWarehouseHandler(ISecurityService securityService)
        {
            _securityService = securityService;
        }

        public async Task<DeleteUserWarehouseResult> Handle(
            DeleteUserWarehouseRequest request,
            CancellationToken cancellationToken)
        {
            var success = await _securityService.DeleteUserWarehouseAsync(
                request.Id ?? "",
                request.DeletedById ?? "",
                cancellationToken);

            return new DeleteUserWarehouseResult
            {
                Success = success
            };
        }
    }

}
