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
    public class SalesOrderItemDetailsConfiguration
     : IEntityTypeConfiguration<SalesOrderItemDetails>
    {
        public void Configure(EntityTypeBuilder<SalesOrderItemDetails> builder)
        {
            builder.ToTable(
                "SalesOrderItemDetails",
                schema: "mobile_stores"
            );

            // Primary Key
            builder.HasKey(x => x.Id);

            // Columns
            builder.Property(x => x.Id)
                .IsRequired();

            builder.Property(x => x.SalesOrderItemId)
                .IsRequired();

            builder.Property(x => x.RowIndex)
                .IsRequired();

            builder.Property(x => x.IMEI1)
                .HasMaxLength(100);

            builder.Property(x => x.IMEI2)
                .HasMaxLength(100);

            builder.Property(x => x.ServiceNo)
                .HasMaxLength(100);

            // Audit fields (BaseEntity)
            builder.Property(x => x.CreatedAtUtc)
                .HasColumnType("timestamp without time zone")
                .HasDefaultValueSql("(now() AT TIME ZONE 'utc')");

            builder.Property(x => x.UpdatedAtUtc)
                .HasColumnType("timestamp without time zone");

            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            // Foreign Key
            builder.HasOne(x => x.SalesOrderItem)
                .WithMany(x => x.Attributes)
                .HasForeignKey(x => x.SalesOrderItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes (NON-UNIQUE, IMPORTANT)
            builder.HasIndex(x => x.SalesOrderItemId);
            builder.HasIndex(x => x.IMEI1);
            builder.HasIndex(x => x.IMEI2);
            builder.HasIndex(x => x.ServiceNo);
            builder.HasIndex(x => x.IsDeleted);
        }
    }

}
