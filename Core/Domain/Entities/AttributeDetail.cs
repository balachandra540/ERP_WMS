using Domain.Common;

namespace Domain.Entities;

public class AttributeDetail : BaseEntity
{
    public string AttributeId { get; set; } = string.Empty;

    // Example: Red, Blue, Large
    public string Value { get; set; } = string.Empty;

    public virtual Attribute? Attribute { get; set; }
}
