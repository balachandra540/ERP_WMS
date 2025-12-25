using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class InventoryTransactionAttributesDetails :BaseEntity
    {

        public string InventoryTransactionId { get; set; }
        public InventoryTransaction InventoryTransaction { get; set; } = default!;

        public string? GoodsReceiveItemDetailsId { get; set; }
        public GoodsReceiveItemDetails? GoodsReceiveItemDetails { get; set; }

        public string? SalesOrderItemDetailsId { get; set; }
        public SalesOrderItemDetails? SalesOrderItemDetails { get; set; }


    }

}
