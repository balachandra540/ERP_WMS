using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class TransferOutDetailsConfiguration
     : IEntityTypeConfiguration<TransferOutDetails>
    {
        public void Configure(EntityTypeBuilder<TransferOutDetails> builder)
        {
            builder.ToTable("TransferOutDetails", "mobile_stores");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .IsRequired();

            builder.Property(x => x.TransferOutId)
                .IsRequired();

            builder.Property(x => x.RowIndex)
                .IsRequired();

            builder.Property(x => x.IMEI1);
            builder.Property(x => x.IMEI2);
            builder.Property(x => x.ServiceNo);

            
            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            builder.HasOne(x => x.TransferOut)
                .WithMany(x => x.TransferOutDetails)
                .HasForeignKey(x => x.TransferOutId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}
