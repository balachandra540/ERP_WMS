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

    
}
