using Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;
namespace Domain.Entities;

public class DiscountApprovalLog : BaseEntity
{
    // Identification
    public string? PluCode { get; set; }
    public string? ProductId { get; set; }
    public double Quantity { get; set; }

    // Approver Details
    public string? ApproverUserId { get; set; }
    public string? ApproverName { get; set; }
    public string? ApproverUserGroupId { get; set; }
    public string? ApproverPhone { get; set; }

    // Result
    public string? Status { get; set; } // "Approved" or "Rejected"
    public string? Comments { get; set; }
    public DateTime ActionDate { get; set; }

    
    [ForeignKey("ApproverUserGroupId")]
    public virtual UserGroup? ApproverGroup { get; set; }
}