using Domain.Common;

namespace Domain.Entities;

public class ProductPluCodes : BaseEntity
{
    public string? ProductId { get; set; }
    public virtual Product? Product { get; set; }

    public string? Attribute1DetailId { get; set; }
    public virtual AttributeDetail? Attribute1Detail { get; set; }

    public string? Attribute2DetailId { get; set; }
    public virtual AttributeDetail? Attribute2Detail { get; set; }

    // PLU code as integer (will start from 10001 in DB)
    public int PluCode { get; set; }
}
