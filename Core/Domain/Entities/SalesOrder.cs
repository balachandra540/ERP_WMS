using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class SalesOrder : BaseEntity
{
    public string? Number { get; set; }
    public DateTime? OrderDate { get; set; }
    public SalesOrderStatus? OrderStatus { get; set; }
    public string? Description { get; set; }
    public string? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string? TaxId { get; set; }
    public Tax? Tax { get; set; }

    // 🔥 FINANCIAL SUMMARY COLUMNS
    public double? BeforeTaxAmount { get; set; }      // Gross Total (Pre-Discount)
    public double? TotalDiscountAmount { get; set; }  // Sum of all line savings
    public double? TaxAmount { get; set; }           // Calculated Tax amount
    public double? AfterTaxAmount { get; set; }       // Final Net Payable

    public string? LocationId { get; set; }

    public ICollection<SalesOrderItem> SalesOrderItemList { get; set; } = new List<SalesOrderItem>();
}