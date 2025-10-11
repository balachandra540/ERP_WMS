using Domain.Common; // Adjust as needed

namespace Domain.Entities
{
    public class PurchaseOrderItem : BaseEntity
    {
        //public string Id { get; set; }

        public string PurchaseOrderId { get; set; } = string.Empty;
        public PurchaseOrder PurchaseOrder { get; set; } = null!; // Navigation (if exists)

        public string ProductId { get; set; } = string.Empty;
        public Product Product { get; set; } = null!; // Navigation

        public string? Summary { get; set; }
        public double? UnitPrice { get; set; }
        public double? Quantity { get; set; }
        public double? Total { get; set; }

        public double ReceivedQuantity { get; set; } = 0; // NEW: Cumulative received quantity
    }
}