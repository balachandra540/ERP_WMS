using Domain.Common;
using Domain.Enums;

namespace Domain.Entities;

public class GoodsReceive : BaseEntity
{
    public string? Number { get; set; }
    public DateTime? ReceiveDate { get; set; }
    public GoodsReceiveStatus? Status { get; set; }
    public string? Description { get; set; }
    public string? PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }
    // ✅ Header-level charges
    public double FreightCharges { get; set; } = 0;  // Transport or freight cost for this GRN
    public double OtherCharges { get; set; } = 0;    // Other additional costs (handling, etc.)

    public ICollection<GoodsReceiveItem> GoodsReceiveItems { get; set; } = new List<GoodsReceiveItem>(); // NEW: Optional navigation
}
