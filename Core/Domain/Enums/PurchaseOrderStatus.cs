using System.ComponentModel;

namespace Domain.Enums;

using System.ComponentModel;

    public enum PurchaseOrderStatus
    {
        [Description("Pending")]
        Pending = 0,
        [Description("Cancelled")]
        Cancelled = 1,
        [Description("Approved")]
        Confirmed = 2,
        
    }


