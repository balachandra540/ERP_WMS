using Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class ProductVariant : BaseEntity
{
    public string? ProductId { get; set; }
    public virtual Product? Product { get; set; }

    public string? Attribute1DetailId { get; set; }
    public virtual AttributeDetail? Attribute1Detail { get; set; }

    public string? Attribute2DetailId { get; set; }
    public virtual AttributeDetail? Attribute2Detail { get; set; }

    public string? PluCode { get; set; }
}
