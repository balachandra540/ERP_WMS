using Domain.Common;
using System;

namespace Domain.Entities
{
    public class ProductDiscountDefinition : BaseEntity
    {
        public string ProductId { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public string? ProductName { get; set; }

        public string DiscountName { get; set; } = null!;

        /// <summary>
        /// Flat / Upto
        /// </summary>
        public string DiscountType { get; set; } = null!;

        /// <summary>
        /// Percentage discount (used for both Flat & Upto)
        /// </summary>
        public decimal DiscountPercentage { get; set; }

        /// <summary>
        /// Max discount amount (only for Upto)
        /// </summary>
        public decimal? MaxDiscountAmount { get; set; }

        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
