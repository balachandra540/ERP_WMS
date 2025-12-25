using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class SalesOrderItemDetails : BaseEntity
    {
        public string SalesOrderItemId { get; set; } = null!;

        public int RowIndex { get; set; }

        public string? IMEI1 { get; set; }
        public string? IMEI2 { get; set; }
        public string? ServiceNo { get; set; }

        // Navigation
        public SalesOrderItem SalesOrderItem { get; set; } = null!;
    }
}
