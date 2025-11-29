using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class ProductPluCodesConfiguration : BaseEntityConfiguration<ProductPluCodes>
{
    public override void Configure(EntityTypeBuilder<ProductPluCodes> builder)
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

        // PLU Code (int) with sequence starting at 10001
        builder.Property(x => x.PluCode)
               .HasDefaultValueSql("nextval('plucode_seq')")
               .IsRequired();

        // Relationships
        builder.HasOne(x => x.Product)
               .WithMany(p => p.PluCodes)  // <-- UPDATE Product navigation collection
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.Cascade)
               .HasConstraintName("FK_ProductPluCodes_Product");

        builder.HasOne(x => x.Attribute1Detail)
               .WithMany()
               .HasForeignKey(x => x.Attribute1DetailId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_ProductPluCodes_Attribute1Detail");

        builder.HasOne(x => x.Attribute2Detail)
               .WithMany()
               .HasForeignKey(x => x.Attribute2DetailId)
               .OnDelete(DeleteBehavior.Restrict)
               .HasConstraintName("FK_ProductPluCodes_Attribute2Detail");

        // Indexes
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.Attribute1DetailId);
        builder.HasIndex(x => x.Attribute2DetailId);

        builder.HasIndex(x => x.PluCode)
               .IsUnique();

        // Prevent duplicate combinations
        builder.HasIndex(x => new { x.ProductId, x.Attribute1DetailId, x.Attribute2DetailId })
               .IsUnique()
               .HasDatabaseName("IX_ProductPluCodes_Combination");
    }
}
