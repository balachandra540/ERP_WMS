using Domain.Common;
using System;
using System.Collections.Generic;

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
        /// General percentage used primarily when DiscountType is "Flat"
        /// </summary>
        public decimal DiscountPercentage { get; set; }

        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;

        /// <summary>
        /// Collection of User Group specific limits used when DiscountType is "Upto"
        /// </summary>
        public virtual ICollection<ProductDiscountDetail> ProductDiscountDetails { get; set; }
            = new List<ProductDiscountDetail>();
    }
}