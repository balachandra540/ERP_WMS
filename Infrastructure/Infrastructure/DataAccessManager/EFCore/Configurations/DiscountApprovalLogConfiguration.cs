using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class DiscountApprovalLogConfiguration : BaseEntityConfiguration<DiscountApprovalLog>
{
    public override void Configure(EntityTypeBuilder<DiscountApprovalLog> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.PluCode).HasMaxLength(50);
        builder.Property(x => x.ApproverName).HasMaxLength(NameConsts.MaxLength);
        builder.Property(x => x.Status).HasMaxLength(20);
        builder.Property(x => x.Comments).HasMaxLength(500);

        // Map Foreign Key to UserGroup based on your schema
        builder.HasOne(x => x.ApproverGroup)
            .WithMany()
            .HasForeignKey(x => x.ApproverUserGroupId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for audit lookups
        builder.HasIndex(x => x.PluCode);
        builder.HasIndex(x => x.ApproverUserId);
        builder.HasIndex(x => x.ActionDate);
    }
}