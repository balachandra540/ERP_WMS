using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class SalesOrderItemConfiguration : BaseEntityConfiguration<SalesOrderItem>
{
    public override void Configure(EntityTypeBuilder<SalesOrderItem> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.SalesOrderId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.ProductId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.Summary).HasMaxLength(DescriptionConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.UnitPrice).IsRequired(false);
        builder.Property(x => x.Quantity).IsRequired(false);
        builder.Property(x => x.Total).IsRequired(false);
        // ⭐ FIXED: Use 0.0 (double) instead of 0 (int) to match double? properties
        builder.Property(x => x.DiscountPercentage)
            .IsRequired(false)
            .HasDefaultValue(0.0);

        builder.Property(x => x.DiscountAmount)
            .IsRequired(false)
            .HasDefaultValue(0.0);

        builder.Property(x => x.GrossAmount)
    .IsRequired(false)
    .HasDefaultValue(0.0);
        // --- 🚀 NEW: UP TO DISCOUNT & APPROVAL MAPPING ---
        builder.Property(x => x.UpToDiscount)
            .IsRequired(false)
            .HasDefaultValue(0.0);

        builder.Property(x => x.ApprovalStatus)
            .HasMaxLength(50) // e.g., "Approved", "Waiting Approval"
            .IsRequired(false);

        builder.Property(x => x.ApproverGroupId)
            .HasMaxLength(IdConsts.MaxLength)
            .IsRequired(false);
        //builder.Property(x => x.TaxPercentage)
        //    .IsRequired(false)
        //    .HasDefaultValue(0.0);
        builder.Property(x => x.TaxId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);

        builder.Property(x => x.TaxAmount)
            .HasDefaultValue(0.0);

        builder.Property(x => x.TotalAfterTax)
            .HasDefaultValue(0.0);

        // ⭐ NEW: PLU Code field mapping
        builder.Property(x => x.PluCode)
       .IsRequired(false);


    }
}

