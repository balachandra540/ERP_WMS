using Application.Common.Repositories;
using Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.ProductGroupManager.Commands;

public class DeleteProductGroupResult
{
    public ProductGroup? Data { get; set; }
}

public class DeleteProductGroupRequest : IRequest<DeleteProductGroupResult>
{
    public string? Id { get; init; }
    public string? DeletedById { get; init; }
}

public class DeleteProductGroupValidator : AbstractValidator<DeleteProductGroupRequest>
{
    public DeleteProductGroupValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class DeleteProductGroupHandler : IRequestHandler<DeleteProductGroupRequest, DeleteProductGroupResult>
{
    private readonly ICommandRepository<ProductGroup> _groupRepository;
    private readonly ICommandRepository<ProductGroupAttributes> _attributeRepository;
    private readonly ICommandRepository<ProductGroupAttributeValue> _valueRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductGroupHandler(
        ICommandRepository<ProductGroup> groupRepository,
        ICommandRepository<ProductGroupAttributes> attributeRepository,
        ICommandRepository<ProductGroupAttributeValue> valueRepository,
        IUnitOfWork unitOfWork
    )
    {
        _groupRepository = groupRepository;
        _attributeRepository = attributeRepository;
        _valueRepository = valueRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DeleteProductGroupResult> Handle(DeleteProductGroupRequest request, CancellationToken cancellationToken)
    {
        // ✅ 1️⃣ Fetch ProductGroup
        var group = await _groupRepository.GetAsync(request.Id ?? string.Empty, cancellationToken);
        if (group == null)
            throw new Exception($"Product Group not found: {request.Id}");

        group.UpdatedById = request.DeletedById;

        // ✅ 2️⃣ Get all Attributes linked to this ProductGroup
        var attributes = await _attributeRepository
            .GetQuery()
            .Where(a => a.ProductGroupId == request.Id)
            .ToListAsync(cancellationToken);

        // ✅ 3️⃣ For each attribute, delete its values first
        foreach (var attr in attributes)
        {
            var values = await _valueRepository
                .GetQuery()
                .Where(v => v.AttributeId == attr.Id)
                .ToListAsync(cancellationToken);

            foreach (var val in values)
            {
                _valueRepository.Delete(val);
            }

            _attributeRepository.Delete(attr);
        }

        // ✅ 4️⃣ Finally delete the ProductGroup
        _groupRepository.Delete(group);

        // ✅ 5️⃣ Save all changes together
        await _unitOfWork.SaveAsync(cancellationToken);

        return new DeleteProductGroupResult
        {
            Data = group
        };
    }
}

