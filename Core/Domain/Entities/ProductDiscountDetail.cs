using Domain.Common;

namespace Domain.Entities
{
    public class ProductDiscountDetail : BaseEntity
    {
        public string ProductDiscountDefinitionId { get; set; } = null!;
        public virtual ProductDiscountDefinition ProductDiscountDefinition { get; set; } = null!;

        public string UserGroupId { get; set; } = null!;
        public virtual UserGroup UserGroup { get; set; } = null!;

        /// <summary>
        /// The specific maximum percentage allowed for this User Group
        /// </summary>
        public decimal MaxPercentage { get; set; }
    }
}