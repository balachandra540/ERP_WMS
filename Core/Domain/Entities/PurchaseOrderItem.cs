using Domain.Common; // Adjust as needed

namespace Domain.Entities
{
    using System.ComponentModel.DataAnnotations.Schema;

    public class PurchaseOrderItem : BaseEntity
    {
        public string PurchaseOrderId { get; set; } = string.Empty;
        public PurchaseOrder PurchaseOrder { get; set; } = null!; // Navigation

        public string ProductId { get; set; } = string.Empty;
        public Product Product { get; set; } = null!; // Navigation

        public string? Summary { get; set; }
        public double? UnitPrice { get; set; }
        public double? Quantity { get; set; }

        [NotMapped] // ✅ This will exclude the property from DB mapping
        public double? RemaingQuantity { get; set; }

        public double? Total { get; set; }

        // ✅ Tax fields
        public string? TaxId { get; set; }
        public Tax? Tax { get; set; }

        public double? TaxAmount { get; set; }
        public double? TotalAfterTax { get; set; }

        public double ReceivedQuantity { get; set; } = 0; // NEW: Cumulative received quantity

        // 🔥 NEW FK properties
        public string? Attribute1DetailId { get; set; }
        public AttributeDetail? Attribute1Detail { get; set; }

        public string? Attribute2DetailId { get; set; }
        public AttributeDetail? Attribute2Detail { get; set; }
    }
}