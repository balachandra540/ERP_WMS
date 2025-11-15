using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class PurchaseOrderItemAttributeCombinationConfiguration : BaseEntityConfiguration<PurchaseOrderItemAttributeCombination>
    {
        public override void Configure(EntityTypeBuilder<PurchaseOrderItemAttributeCombination> builder)
        {
           

            builder.Property(x => x.PurchaseOrderItemId)
                .HasColumnName("PurchaseOrderItemId")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.AttributeId)
                .HasColumnName("AttributeId")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.AttributeValueId)
                .HasColumnName("AttributeValueId")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Quantity)
                .HasColumnName("Quantity")
                .HasColumnType("numeric(18,2)")
                .HasDefaultValue(0)
                .IsRequired();

           

            // Foreign keys
            builder.HasOne<PurchaseOrderItem>()
                .WithMany()
                .HasForeignKey(x => x.PurchaseOrderItemId)
                .HasConstraintName("FK_POItemAttributeCombination_PurchaseOrderItem")
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<ProductGroupAttributes>()
                .WithMany()
                .HasForeignKey(x => x.AttributeId)
                .HasConstraintName("FK_POItemAttributeCombination_ProductGroupAttribute");

            builder.HasOne<ProductGroupAttributeValue>()
                .WithMany()
                .HasForeignKey(x => x.AttributeValueId)
                .HasConstraintName("FK_POItemAttributeCombination_ProductGroupAttributeValue");
        }
    }

}
