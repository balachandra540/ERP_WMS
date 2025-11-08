using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ProductGroupAttributeValue : BaseEntity
    {
        public string? AttributeId { get; set; }
        public string? ValueName { get; set; }
       
        public ProductGroupAttributes Attribute { get; set; }
    }

}
