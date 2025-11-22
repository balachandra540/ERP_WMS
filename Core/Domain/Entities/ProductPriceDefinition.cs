using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ProductPriceDefinition : BaseEntity
    {
        public string ProductId { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public string? ProductName { get; set; }

        public decimal CostPrice { get; set; }
        public decimal MarginPercentage { get; set; } = 10.00m;
        //public decimal SalePrice { get; private set; } // Computed column
        public decimal SalePrice { get;  set; } // Computed column

        public string? CurrencyCode { get; set; } = "INR";

        public DateTime? EffectiveFrom { get; set; } 
        public DateTime? EffectiveTo { get; set; }
        public bool IsActive { get; set; } = true;

       

    }

}
