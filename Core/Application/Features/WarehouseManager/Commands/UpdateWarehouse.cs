using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.WarehouseManager.Commands;

public class UpdateWarehouseResult
{
    public Warehouse? Data { get; set; }
}

public class UpdateWarehouseRequest : IRequest<UpdateWarehouseResult>
{
    public string? Id { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? UpdatedById { get; init; }
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

public class UpdateWarehouseValidator : AbstractValidator<UpdateWarehouseRequest>
{
    public UpdateWarehouseValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty();
    }
}

public class UpdateWarehouseHandler : IRequestHandler<UpdateWarehouseRequest, UpdateWarehouseResult>
{
    private readonly ICommandRepository<Warehouse> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateWarehouseHandler(
        ICommandRepository<Warehouse> repository,
        IUnitOfWork unitOfWork
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateWarehouseResult> Handle(UpdateWarehouseRequest request, CancellationToken cancellationToken)
    {

        var entity = await _repository.GetAsync(request.Id ?? string.Empty, cancellationToken);

        if (entity == null)
        {
            throw new Exception($"Entity not found: {request.Id}");
        }

        if (entity.SystemWarehouse == true)
        {
            throw new Exception($"Updating system warehouse is not allowed.");
        }

        entity.UpdatedById = request.UpdatedById;

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.City = request.City;
        entity.Country = request.Country;
        entity.Street = request.Street;
        entity.State = request.State;
        entity.Currency = request.Currency;
        entity.EmailAddress = request.EmailAddress;
        entity.FaxNumber = request.FaxNumber;
        entity.GstNumber = request.GstNumber;
        entity.PhoneNumber = request.PhoneNumber;
        entity.Logo = request.Logo;
        entity.State = request.State;
        entity.ZipCode = request.ZipCode;
        entity.Type = request.Type;


        _repository.Update(entity);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new UpdateWarehouseResult
        {
            Data = entity
        };
    }
}

