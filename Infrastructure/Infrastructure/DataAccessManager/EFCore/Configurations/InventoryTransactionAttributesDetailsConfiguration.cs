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
                .WithMany()
                .HasForeignKey(x => x.InventoryTransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.GoodsReceiveItemDetails)
                .WithMany()
                .HasForeignKey(x => x.GoodsReceiveItemDetailsId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

}
