using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Application.Features.WarehouseManager.Queries;
using Domain.Entities;
using FluentValidation;
using MediatR;


namespace Application.Features.WarehouseManager.Commands
{
    internal class UpdateWarehouseLogo
    {
    }
    public class UpdateWarehouseLogoResult
    {
        public string? Data { get; init; }
    }

    public class UpdateWarehouseLogoRequest : IRequest<UpdateWarehouseLogoResult>
    {
        public string? WarehouseId { get; init; }
        public string? Logo { get; init; }
    }

    public class UpdateWarehouseLogoValidator : AbstractValidator<UpdateWarehouseLogoRequest>
    {
        public UpdateWarehouseLogoValidator()
        {
            RuleFor(x => x.WarehouseId).NotEmpty();
            RuleFor(x => x.Logo).NotEmpty();
        }
    }

    public class UpdateWarehouseLogoHandler : IRequestHandler<UpdateWarehouseLogoRequest, UpdateWarehouseLogoResult>
    {

        private readonly ICommandRepository<Warehouse> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateWarehouseLogoHandler(
            ICommandRepository<Warehouse> repository,
            IUnitOfWork unitOfWork
            )
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<UpdateWarehouseLogoResult> Handle(UpdateWarehouseLogoRequest request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetAsync(request.WarehouseId ?? string.Empty, cancellationToken);

            if (entity == null)
            {
                throw new Exception($"Entity not found: {request.WarehouseId}");
            }

            //entity.
            entity.Logo = request.Logo;
            //entity.Id = request.WarehouseId;

             _repository.Update(entity);
            await _unitOfWork.SaveAsync(cancellationToken);

            return new UpdateWarehouseLogoResult
            {
                Data = "Update Logo Success"
            };
        }
    }
}
