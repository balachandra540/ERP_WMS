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

        public double ReceivedQuantity { get; set; }

        // ✅ Pricing fields
        public double UnitPrice { get; set; }            // Base unit cost
        public double TaxAmount { get; set; }            // Tax per unit
        public double FinalUnitPrice { get; set; }       // UnitPrice + TaxAmount + Freight/Other proportion
        public double MRP { get; set; }                  // Mandatory retail price per unit
        public double FreightChargesPerUnit { get; set; } = 0; // NEW: Freight per item
        public double OtherChargesPerUnit { get; set; } = 0;   // NEW: Other per item

        public string? Notes { get; set; }               // Optional notes for partial receives or QC remarks
        public ICollection<GoodsReceiveItemDetails> Attributes { get; set; } = new List<GoodsReceiveItemDetails>();
        public string? Attribute1DetailId { get; set; }
        public string? Attribute2DetailId { get; set; }

    }
}
