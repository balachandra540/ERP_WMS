using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    

    public class ProductPriceDefinitionConfiguration : BaseEntityConfiguration<ProductPriceDefinition>
    {
        public override void Configure(EntityTypeBuilder<ProductPriceDefinition> builder)
        {
            builder.ToTable("ProductPriceDefinition");

            
            builder.Property(x => x.ProductId)
                .HasMaxLength(64)
                .IsRequired();

            builder.Property(x => x.ProductName)
                .HasMaxLength(255)
               .IsRequired(false);


            builder.Property(x => x.CostPrice)
                .HasColumnType("numeric(18,2)")
                .IsRequired();

            builder.Property(x => x.MarginPercentage)
                .HasColumnType("numeric(5,2)")
                .HasDefaultValue(10.00m)
                .IsRequired();

            builder.Property(x => x.SalePrice)
                .HasColumnType("numeric(18,2)")
                .ValueGeneratedOnAddOrUpdate() // Computed column
                .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);

            builder.Property(x => x.CurrencyCode)
                .HasMaxLength(10)
                .HasDefaultValue("INR");

            builder.Property(x => x.EffectiveFrom)
                .HasDefaultValueSql("CURRENT_DATE");

            builder.Property(x => x.IsActive)
                .HasDefaultValue(true);

            builder.Property(x => x.SalePrice)
    .HasComputedColumnSql("\"CostPrice\" + (\"CostPrice\" * \"MarginPercentage\" / 100)", stored: true);


            // === CRITICAL FIX: Proper relationship to avoid shadow property ProductId1 ===
            builder.HasOne(x => x.Product)                    // navigation property on PriceDefinition
                   .WithMany(p => p.PriceDefinitions)         // ← inverse collection on Product!
                   .HasForeignKey(x => x.ProductId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .HasConstraintName("FK_ProductPriceDefinition_Product");
        }
    }

}
