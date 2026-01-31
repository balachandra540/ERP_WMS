using Domain.Common;

namespace Domain.Entities;

using System.ComponentModel.DataAnnotations.Schema;

public class Product : BaseEntity
{
    public string? Name { get; set; }
    public string? Number { get; set; }
    public string? Description { get; set; }
    public double? UnitPrice { get; set; }
    public bool? Physical { get; set; } = true;                    // Made non-nullable (default true)
    public string? HsnCode { get; set; }     // NEW

    public string? TaxType { get; set; }     // Included / Excluded
    public string? UnitMeasureId { get; set; }
    public UnitMeasure? UnitMeasure { get; set; }

    public string? ProductGroupId { get; set; }
    public ProductGroup? ProductGroup { get; set; }

    public string? TaxId { get; set; }
    public Tax? Tax { get; set; }

    public string? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }                      // Optional navigation

    // ================================
    // ========== NEW FIELDS ==========
    // ================================

    // Attribute 1 & 2 (Dropdowns)
    public string? Attribute1Id { get; set; }
    public virtual Attribute? Attribute1 { get; set; }

    public string? Attribute2Id { get; set; }
    public virtual Attribute? Attribute2 { get; set; }

    // Booleans (Checkboxes)
    public bool ServiceNo { get; set; } = false;   // renamed to follow C# conventions
    public bool Imei1 { get; set; } = false;
    public bool Imei2 { get; set; } = false;

    // Optional: Human-readable display properties (for grids/reports)
    [NotMapped]
    public string? Attribute1Name => Attribute1?.Name;

    [NotMapped]
    public string? Attribute2Name => Attribute2?.Name;

    public virtual ICollection<ProductPluCodes> PluCodes { get; set; }
    = new List<ProductPluCodes>();

    public virtual ICollection<ProductPriceDefinition> PriceDefinitions { get; set; }
        = new List<ProductPriceDefinition>();
    public virtual ICollection<ProductDiscountDefinition> DiscountDefinitions { get; set; }
    = new List<ProductDiscountDefinition>();

}
