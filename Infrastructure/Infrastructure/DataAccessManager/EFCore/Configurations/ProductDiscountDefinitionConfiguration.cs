using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class ProductDiscountDefinitionConfiguration
        : BaseEntityConfiguration<ProductDiscountDefinition>
    {
        public override void Configure(EntityTypeBuilder<ProductDiscountDefinition> builder)
        {
            builder.ToTable("ProductDiscountDefinition");

            // -----------------------------
            //        BASIC FIELDS
            //------------------------------

            builder.Property(x => x.ProductId)
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.ProductName)
                .HasMaxLength(255)
                .IsRequired(false);

            builder.Property(x => x.DiscountName)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.DiscountType)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.DiscountPercentage)
                .HasColumnType("numeric(5,2)")
                .IsRequired();

            builder.Property(x => x.MaxDiscountAmount)
                .HasColumnType("numeric(18,2)")
                .IsRequired(false);

            builder.Property(x => x.EffectiveFrom)
                .HasDefaultValueSql("CURRENT_DATE");

            builder.Property(x => x.IsActive)
                .HasDefaultValue(true);

            // -----------------------------
            //        CONSTRAINTS
            //------------------------------

            builder.HasCheckConstraint(
                "CHK_ProductDiscountDefinition_DiscountType",
                "\"DiscountType\" IN ('Flat','Upto')"
            );

            builder.HasCheckConstraint(
                "CHK_ProductDiscountDefinition_DiscountPercentage",
                "\"DiscountPercentage\" > 0 AND \"DiscountPercentage\" <= 100"
            );

            // -----------------------------
            //        RELATIONSHIP
            //------------------------------
            // === CRITICAL FIX: avoid shadow ProductId1 ===
            builder.HasOne(x => x.Product)                         // navigation on DiscountDefinition
                   .WithMany(p => p.DiscountDefinitions)          // inverse collection on Product
                   .HasForeignKey(x => x.ProductId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ProductDiscountDefinition_Product");
        }
    }
}
