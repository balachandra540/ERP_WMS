using System.ComponentModel;

namespace Domain.Enums;

public enum DeliveryOrderStatus
{
    [Description("Pending")]
    Pending = 0,

    [Description("Cancelled")]
    Cancelled = 1,

    [Description("Approved")]
    Approved = 2
}