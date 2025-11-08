using Application.Common.Repositories;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using FluentValidation;
using MediatR;

namespace Application.Features.ProductGroupAttributeManager.Commands
{
    // ✅ Result
    public class CreateProductGroupAttributeResult
    {
        public ProductGroupAttributes? Data { get; set; }
    }

    // ✅ Request
    public class CreateProductGroupAttributeRequest : IRequest<CreateProductGroupAttributeResult>
    {
        public string ProductGroupId { get; init; }
        public string AttributeName { get; init; }
        //public string? AttributeValue { get; init; }
        //public DateTime? CreatedDate { get; init; }
        public string? CreatedBy { get; init; }
    }

    // ✅ Validation
    public class CreateProductGroupAttributeValidator : AbstractValidator<CreateProductGroupAttributeRequest>
    {
        public CreateProductGroupAttributeValidator()
        {
            RuleFor(x => x.ProductGroupId).NotEmpty();
            RuleFor(x => x.AttributeName).NotEmpty();
        }
    }

    // ✅ Handler
    public class CreateProductGroupAttributeHandler : IRequestHandler<CreateProductGroupAttributeRequest, CreateProductGroupAttributeResult>
    {
        private readonly ICommandRepository<ProductGroupAttributes> _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISecurityService _securityService;

        public CreateProductGroupAttributeHandler(
            ICommandRepository<ProductGroupAttributes> repository,
            IUnitOfWork unitOfWork,
            ISecurityService securityService)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _securityService = securityService;
        }

        public async Task<CreateProductGroupAttributeResult> Handle(CreateProductGroupAttributeRequest request, CancellationToken cancellationToken)
        {
            var entity = new ProductGroupAttributes
            {
                ProductGroupId = request.ProductGroupId,
                AttributeName = request.AttributeName,
                //AttributeValue = request.AttributeValue,
                CreatedById = request.CreatedBy,
                //CreatedDate = (_securityService.ConvertToIst(request.CreatedDate) ?? DateTime.UtcNow).ToUniversalTime(),


            };

            await _repository.CreateAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            return new CreateProductGroupAttributeResult
            {
                Data = entity
            };
        }
    }
}
