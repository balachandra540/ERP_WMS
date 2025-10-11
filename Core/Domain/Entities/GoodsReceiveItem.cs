using Domain.Common; // Adjust if your BaseEntity is elsewhere
using Domain.Entities; // For InventoryTransaction

namespace Domain.Entities
{
    public class GoodsReceiveItem : BaseEntity
    {
        public string GoodsReceiveId { get; set; } = string.Empty;
        public GoodsReceive GoodsReceive { get; set; } = null!; // Navigation property

        public string PurchaseOrderItemId { get; set; } = string.Empty;
        public PurchaseOrderItem PurchaseOrderItem { get; set; } = null!; // Navigation property
        public string Id { get; set; } 

        public double ReceivedQuantity { get; set; }
        public string? Notes { get; set; } // Optional notes for partial receives (changed to set for updates)
        //public string? WarehouseId { get; set; } // Warehouse where received

        // Navigation to inventory transactions created from this receive item
        public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    }
}