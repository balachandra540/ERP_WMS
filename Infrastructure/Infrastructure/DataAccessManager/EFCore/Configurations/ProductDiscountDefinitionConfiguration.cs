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
            //         BASIC FIELDS
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

            builder.Property(x => x.EffectiveFrom)
                .IsRequired();

            builder.Property(x => x.EffectiveTo)
                .IsRequired(false);

            builder.Property(x => x.IsActive)
                .HasDefaultValue(true);

            // -----------------------------
            //         CONSTRAINTS
            //------------------------------

            builder.HasCheckConstraint(
                "CHK_ProductDiscountDefinition_DiscountType",
                "\"DiscountType\" IN ('Flat','Upto')"
            );

            // -----------------------------
            //        RELATIONSHIPS
            //------------------------------

            // Link to Product
            builder.HasOne(x => x.Product)
                   .WithMany(p => p.DiscountDefinitions)
                   .HasForeignKey(x => x.ProductId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ProductDiscountDefinition_Product");

            // Link to Child Details (One-to-Many)
            builder.HasMany(x => x.ProductDiscountDetails)
                   .WithOne(d => d.ProductDiscountDefinition)
                   .HasForeignKey(d => d.ProductDiscountDefinitionId)
                   .OnDelete(DeleteBehavior.Cascade) // Deleting definition removes all its user group rules
                   .HasConstraintName("FK_ProductDiscountDefinition_Details");
        }
    }
}