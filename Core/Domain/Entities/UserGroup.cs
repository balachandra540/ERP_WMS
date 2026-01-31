using Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;

public class UserGroup : BaseEntity
{
    // ================================
    // ========== BASIC INFO ==========
    // ================================

    public string? Name { get; set; }
    public string? Description { get; set; }

    // ================================
    // ======== BUSINESS FLAGS ========
    // ================================

    /// <summary>
    /// Indicates whether this user group is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Enables special discount rules for this group
    /// </summary>
    public bool IsSpecialDiscount { get; set; } = false;

    /// <summary>
    /// Maximum allowed special discount percentage
    /// Applicable ONLY when IsSpecialDiscount = true
    /// </summary>
    public decimal? MaxSpecialDiscount { get; set; }

    // ================================
    // ===== OPTIONAL HELPERS =========
    // ================================

    /// <summary>
    /// Human-readable display value for grids/reports
    /// </summary>
    [NotMapped]
    public string SpecialDiscountDisplay =>
        IsSpecialDiscount && MaxSpecialDiscount.HasValue
            ? $"{MaxSpecialDiscount}%"
            : "—";
}
