using System.ComponentModel;

namespace Domain.Enums
{
    public enum GoodsReceiveStatus
    {
        [Description("Draft")]
        Draft = 0,
        [Description("Cancelled")]
        Cancelled = 1,
        [Description("Confirmed")]
        Confirmed = 2,
        [Description("Approved")]
        Approved = 3,    // Added Approved
        [Description("Archived")]
        Archived = 4
    }
}
