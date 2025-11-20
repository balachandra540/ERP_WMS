using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class ProductVariantConfiguration : BaseEntityConfiguration<ProductVariant>
{
    public override void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        base.Configure(builder);

        // FK IDs
        builder.Property(x => x.ProductId)
               .HasMaxLength(IdConsts.MaxLength)
               .IsRequired();

        builder.Property(x => x.Attribute1DetailId)
               .HasMaxLength(IdConsts.MaxLength)
               .IsRequired();

        builder.Property(x => x.Attribute2DetailId)
               .HasMaxLength(IdConsts.MaxLength)
               .IsRequired();

        // PLU Code
        builder.Property(x => x.PluCode)
               .HasMaxLength(NameConsts.MaxLength * 3) // Product + Attr1 + Attr2
               .IsRequired();

        builder.HasOne(x => x.Product)
       .WithMany(p => p.Variants)   // ← THIS IS THE KEY LINE
       .HasForeignKey(x => x.ProductId)
       .OnDelete(DeleteBehavior.Cascade)
       .HasConstraintName("FK_ProductVariant_Product");
        builder.HasOne(x => x.Attribute1Detail)
               .WithMany()
               .HasForeignKey(x => x.Attribute1DetailId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_ProductVariant_Attribute1Detail");

        builder.HasOne(x => x.Attribute2Detail)
               .WithMany()
               .HasForeignKey(x => x.Attribute2DetailId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_ProductVariant_Attribute2Detail");

        // Indexes
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.Attribute1DetailId);
        builder.HasIndex(x => x.Attribute2DetailId);
        builder.HasIndex(x => x.PluCode).IsUnique();

        // Combination Index — ensures same combination cannot be duplicated
        builder.HasIndex(x => new { x.ProductId, x.Attribute1DetailId, x.Attribute2DetailId })
               .IsUnique()
               .HasDatabaseName("IX_ProductVariant_Combination");
    }
}
