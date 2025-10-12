using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.WarehouseManager.Commands;

public class CreateWarehouseResult
{
    public Warehouse? Data { get; set; }
}

public class CreateWarehouseRequest : IRequest<CreateWarehouseResult>
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? CreatedById { get; init; }
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

public class CreateWarehouseValidator : AbstractValidator<CreateWarehouseRequest>
{
    public CreateWarehouseValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}

public class CreateWarehouseHandler : IRequestHandler<CreateWarehouseRequest, CreateWarehouseResult>
{
    private readonly ICommandRepository<Warehouse> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateWarehouseHandler(
        ICommandRepository<Warehouse> repository,
        IUnitOfWork unitOfWork
        )
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CreateWarehouseResult> Handle(CreateWarehouseRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Warehouse();
        entity.CreatedById = request.CreatedById;

        entity.Name = request.Name;
        entity.SystemWarehouse = false;
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

        await _repository.CreateAsync(entity, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        return new CreateWarehouseResult
        {
            Data = entity
        };
    }
}