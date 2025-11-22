using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class ProductConfiguration : BaseEntityConfiguration<Product>
{
    public override void Configure(EntityTypeBuilder<Product> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.Name).HasMaxLength(NameConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.Number).HasMaxLength(CodeConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.Description).HasMaxLength(DescriptionConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.UnitPrice).IsRequired(false);
        builder.Property(x => x.Physical).IsRequired(false);
        builder.Property(x => x.UnitMeasureId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.ProductGroupId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.TaxId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);
        builder.Property(x => x.Attribute1Id)
               .HasMaxLength(IdConsts.MaxLength)
               .IsRequired(false);

        builder.Property(x => x.Attribute2Id)
               .HasMaxLength(IdConsts.MaxLength)
               .IsRequired(false);

        builder.Property(x => x.ServiceNo)
               .IsRequired()
               .HasDefaultValue(false);

        builder.Property(x => x.Imei1)
               .IsRequired()
               .HasDefaultValue(false);

        builder.Property(x => x.Imei2)
               .IsRequired()
               .HasDefaultValue(false);
        // Optional Attribute Relationships (can be null)
        builder.HasOne(x => x.Attribute1)
               .WithMany()
               .HasForeignKey(x => x.Attribute1Id)
               .OnDelete(DeleteBehavior.SetNull)
               .HasConstraintName("FK_Product_Attribute1");

        builder.HasOne(x => x.Attribute2)
               .WithMany()
               .HasForeignKey(x => x.Attribute2Id)
               .OnDelete(DeleteBehavior.SetNull)
               .HasConstraintName("FK_Product_Attribute2");
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => e.Number);
        builder.HasIndex(x => x.Attribute1Id);
        builder.HasIndex(x => x.Attribute2Id);

        // Great for filtering mobile/service products in grids
        builder.HasIndex(x => new { x.Physical, x.ServiceNo, x.Imei1, x.Imei2 });

        // ===============================
        // NEW: Navigation Relationships
        // ===============================

        // Product → ProductPriceDefinition (1:M)
        builder.HasMany(p => p.PriceDefinitions)
            .WithOne()
            .HasForeignKey(pd => pd.ProductId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Product_ProductPriceDefinition");

        // Product → ProductVariant (1:M)
        builder.HasMany(p => p.Variants)
            .WithOne()
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("FK_Product_ProductVariant");

    }
}

