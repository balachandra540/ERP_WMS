using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class ProductDiscountDetailConfiguration
        : BaseEntityConfiguration<ProductDiscountDetail>
    {
        public override void Configure(EntityTypeBuilder<ProductDiscountDetail> builder)
        {
            builder.ToTable("ProductDiscountDetail");

            // -----------------------------
            //         BASIC FIELDS
            //------------------------------

            builder.Property(x => x.ProductDiscountDefinitionId)
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.UserGroupId)
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.MaxPercentage)
                .HasColumnType("numeric(5,2)")
                .IsRequired();

            // -----------------------------
            //         CONSTRAINTS
            //------------------------------

            builder.HasCheckConstraint(
                "CHK_ProductDiscountDetail_MaxPercentage",
                "\"MaxPercentage\" > 0 AND \"MaxPercentage\" <= 100"
            );

            // -----------------------------
            //        RELATIONSHIPS
            //------------------------------

            // 1. Link to Parent (ProductDiscountDefinition)
            builder.HasOne(x => x.ProductDiscountDefinition)
                   .WithMany(p => p.ProductDiscountDetails)
                   .HasForeignKey(x => x.ProductDiscountDefinitionId)
                   .OnDelete(DeleteBehavior.Cascade) // CRITICAL: Deletes child rows when parent is deleted
                   .HasConstraintName("FK_ProductDiscountDetail_ProductDiscountDefinition");

            // 2. Link to UserGroup
            builder.HasOne(x => x.UserGroup)
                   .WithMany() // Assuming UserGroup doesn't need a collection of details
                   .HasForeignKey(x => x.UserGroupId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ProductDiscountDetail_UserGroup");
        }
    }
}