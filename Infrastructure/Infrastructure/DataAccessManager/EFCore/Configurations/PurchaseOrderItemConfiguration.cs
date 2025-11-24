using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class PurchaseOrderItemConfiguration : BaseEntityConfiguration<PurchaseOrderItem>
{
    public override void Configure(EntityTypeBuilder<PurchaseOrderItem> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.PurchaseOrderId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.ProductId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.Summary).HasMaxLength(DescriptionConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.UnitPrice).IsRequired(false);
        builder.Property(x => x.Quantity).IsRequired(false);
        builder.Property(x => x.Total).IsRequired(false);
        builder.Property(e => e.ReceivedQuantity) // NEW
                   .HasColumnType("double precision")
                   .IsRequired()
                   .HasDefaultValue(0.0);
        // ✅ Add new tax-related properties
        builder.Property(x => x.TaxId)
            .HasMaxLength(IdConsts.MaxLength)
            .IsRequired(false);

        builder.Property(x => x.TaxAmount)
            .HasColumnType("double precision")
            .IsRequired(false);

        builder.Property(x => x.TotalAfterTax)
            .HasColumnType("double precision")
            .IsRequired(false);

        // ✅ Define foreign key relationship for Tax
        builder.HasOne(x => x.Tax)
            .WithMany()
            .HasForeignKey(x => x.TaxId)
            .OnDelete(DeleteBehavior.NoAction);
        builder.Property(x => x.Attribute1DetailId)
    .HasMaxLength(IdConsts.MaxLength)
    .IsRequired(false);

        builder.Property(x => x.Attribute2DetailId)
            .HasMaxLength(IdConsts.MaxLength)
            .IsRequired(false);

        builder.HasOne(x => x.Attribute1Detail)
    .WithMany()
    .HasForeignKey(x => x.Attribute1DetailId)
    .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(x => x.Attribute2Detail)
            .WithMany()
            .HasForeignKey(x => x.Attribute2DetailId)
            .OnDelete(DeleteBehavior.NoAction);


    }
}

