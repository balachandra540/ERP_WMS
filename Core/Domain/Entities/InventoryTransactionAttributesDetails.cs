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

        public string InventoryTransactionId { get; set; } = null!;
        public string GoodsReceiveItemDetailsId { get; set; } = null!;

        // Optional Navigation
        public InventoryTransaction? InventoryTransaction { get; set; }
        public GoodsReceiveItemDetails? GoodsReceiveItemDetails { get; set; }

       

    }

}
