using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Infrastructure.DataAccessManager.EFCore.Configurations
{

    public class GoodsReceiveItemDetailConfiguration : IEntityTypeConfiguration<GoodsReceiveItemDetails>
    {
       
            public void Configure(EntityTypeBuilder<GoodsReceiveItemDetails> builder)
            {
                builder.ToTable("GoodsReceiveItemDetails", "mobile_stores");

                // PK
                builder.HasKey(x => x.Id);

                // Columns
                builder.Property(x => x.GoodsReceiveItemId)
                    .HasColumnName("GoodsReceiveItemId")
                    .HasColumnType("text")
                    .IsRequired();

                builder.Property(x => x.RowIndex)
                    .HasColumnType("integer")
                    .IsRequired();

                builder.Property(x => x.IMEI1).HasColumnType("text");
                builder.Property(x => x.IMEI2).HasColumnType("text");
                //builder.Property(x => x.SerialNo).HasColumnType("text");
                builder.Property(x => x.ServiceNo).HasColumnType("text");

                // Correct Foreign Key Mapping (ONLY ONCE)
                builder
                    .HasOne(x => x.GoodsReceiveItem)
                    .WithMany(x => x.Attributes)
                    .HasForeignKey(x => x.GoodsReceiveItemId)
                    .OnDelete(DeleteBehavior.Cascade);


            }
        
    }

}
