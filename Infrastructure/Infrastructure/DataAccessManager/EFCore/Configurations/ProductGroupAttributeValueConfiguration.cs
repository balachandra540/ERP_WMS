using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class ProductGroupAttributeValueConfiguration : BaseEntityConfiguration<ProductGroupAttributeValue>
    {
        public override void Configure(EntityTypeBuilder<ProductGroupAttributeValue> builder)
        {
            builder.ToTable("ProductGroupAttributeValues");

            //// Primary key
            //builder.HasKey(x => x.Id);

            //builder.Property(x => x.Id)
            //    .HasMaxLength(50)
            //    .IsRequired();

            // Foreign key
            builder.Property(x => x.AttributeId)
                .HasMaxLength(50)
                .IsRequired();

            // Value name (actual attribute value like "Red", "Large", etc.)
            builder.Property(x => x.ValueName)
                .HasMaxLength(200)
                .IsRequired();

            // Audit columns
            //builder.Property(x => x.CreatedById)
            //    .HasMaxLength(50);

            //builder.Property(x => x.UpdatedById)
            //    .HasMaxLength(50);

            //builder.Property(x => x.IsDeleted)
            //    .HasDefaultValue(false);

            //// Timestamps (with timezone)
            //builder.Property(x => x.CreatedAtUtc)
            //    .HasColumnType("timestamp with time zone")
            //    .HasDefaultValueSql("CURRENT_TIMESTAMP");

            //builder.Property(x => x.UpdatedAtUtc)
            //    .HasColumnType("timestamp with time zone")
            //    .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Relationship
            builder.HasOne(x => x.Attribute)
                   .WithMany(a => a.Values)
                   .HasForeignKey(x => x.AttributeId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
