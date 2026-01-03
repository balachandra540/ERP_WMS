using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class InventoryTransactionAttributesDetailsConfiguration
    : BaseEntityConfiguration<InventoryTransactionAttributesDetails>
    {
        public override void Configure(EntityTypeBuilder<InventoryTransactionAttributesDetails> builder)
        {
            builder.ToTable("InventoryTransactionAttributesDetails");


            builder.HasOne(x => x.InventoryTransaction)
              .WithMany(x => x.InventoryTransactionAttributesDetails)
                .HasForeignKey(x => x.InventoryTransactionId)
                .OnDelete(DeleteBehavior.Restrict).IsRequired();

            // Optional FK to GoodsReceiveItemDetails
            builder.HasOne(x => x.GoodsReceiveItemDetails)
                  .WithMany()
                  .HasForeignKey(x => x.GoodsReceiveItemDetailsId)
                  .OnDelete(DeleteBehavior.Restrict)
                  .IsRequired(false);

            // Optional FK to SalesOrderItemDetails
            builder.HasOne(x => x.SalesOrderItemDetails)
                  .WithMany()
                  .HasForeignKey(x => x.SalesOrderItemDetailsId)
                  .OnDelete(DeleteBehavior.Restrict)
                  .IsRequired(false);
            builder.Property(x => x.TransferOutDetailsId);

            builder.HasOne(x => x.TransferOutDetails)
                .WithMany() // no back-navigation required
                .HasForeignKey(x => x.TransferOutDetailsId)
                .OnDelete(DeleteBehavior.SetNull);

        }
    }

}
