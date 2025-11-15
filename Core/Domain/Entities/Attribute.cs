using Domain.Common;

namespace Domain.Entities;

public class Attribute : BaseEntity
{
    public string Number { get; set; } = string.Empty;
    // Example: Color, Size, Material
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Values like Red, Blue, Large, etc.
    public ICollection<AttributeDetail> AttributeDetails { get; set; } = new List<AttributeDetail>();
}
