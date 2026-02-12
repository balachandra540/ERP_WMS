using Domain.Common;

namespace Domain.Entities;

public class SalesOrderItem : BaseEntity
{
    public string? SalesOrderId { get; set; }
    public SalesOrder? SalesOrder { get; set; }
    public string? ProductId { get; set; }
    public int? PluCode { get; set; }
    public Product? Product { get; set; }
    public string? Summary { get; set; }
    public double? UnitPrice { get; set; } = 0;
    public double? Quantity { get; set; } = 1;

    //  NEW FINANCIAL COLUMNS
    public double? DiscountPercentage { get; set; } = 0; // The % discount applied
    public double? DiscountAmount { get; set; } = 0;     // Total savings for this line
    public double? GrossAmount { get; set; } = 0;        // Total before discount (Qty * Price)
                                                         // 🔥 NEW: UP TO DISCOUNT & APPROVAL COLUMNS
    public double? UpToDiscount { get; set; } = 0;       // Manual % entered by user
    public string? ApprovalStatus { get; set; }          // e.g., "Approved", "Auto-Approved", "Waiting Approval"
    public string? ApproverGroupId { get; set; }         // The Group ID required/used for approval


    //  TAX (NEW)
    //public double? TaxPercentage { get; set; }

    public string? TaxId { get; set; }

    public double TaxAmount { get; set; } = 0;
    public double TotalAfterTax { get; set; } = 0;

    public double? Total { get; set; } = 0; // Final Net amount (Gross - Discount)

    public ICollection<SalesOrderItemDetails> Attributes { get; set; } = new List<SalesOrderItemDetails>();
}