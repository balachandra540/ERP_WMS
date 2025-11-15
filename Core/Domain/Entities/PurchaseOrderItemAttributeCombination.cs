using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class PurchaseOrderItemAttributeCombination : BaseEntity
    {
        //public string Id { get; set; } = Guid.NewGuid().ToString();

        public string? PurchaseOrderItemId { get; set; }
        public string? AttributeId { get; set; }
        public string? AttributeValueId { get; set; }

        public decimal Quantity { get; set; } = 0;
    }
}
