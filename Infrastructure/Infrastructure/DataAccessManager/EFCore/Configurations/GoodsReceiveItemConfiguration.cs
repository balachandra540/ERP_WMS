﻿using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class GoodsReceiveItemConfiguration : IEntityTypeConfiguration<GoodsReceiveItem>
    {
        public void Configure(EntityTypeBuilder<GoodsReceiveItem> builder)
        {
            builder.ToTable("GoodsReceiveItem", "mobile_stores");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(e => e.GoodsReceiveId)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(e => e.PurchaseOrderItemId)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(e => e.ReceivedQuantity)
                   .HasColumnType("double precision")
                   .IsRequired();

            builder.Property(e => e.Notes)
                   .HasMaxLength(4000);

            builder.Property(e => e.CreatedById)
                   .HasMaxLength(450);

            builder.Property(e => e.UpdatedById)
                   .HasMaxLength(450);

            builder.Property(e => e.IsDeleted)
                   .IsRequired()
                   .HasDefaultValue(false);

            builder.Property(e => e.CreatedAtUtc)
                   .HasColumnType("timestamp without time zone");

            builder.Property(e => e.UpdatedAtUtc)
                   .HasColumnType("timestamp without time zone");

            // Relationships
            builder.HasOne(e => e.GoodsReceive)
                   .WithMany(g => g.GoodsReceiveItems) // Requires ICollection<GoodsReceiveItem> in GoodsReceive
                   .HasForeignKey(e => e.GoodsReceiveId)
                   .OnDelete(DeleteBehavior.Restrict);

            //builder.HasOne(e => e.PurchaseOrderItem)
            //       .WithMany(p => p.GoodsReceiveItems) // Requires ICollection<GoodsReceiveItem> in PurchaseOrderItem
            //       .HasForeignKey(e => e.PurchaseOrderItemId)
            //       .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(e => e.GoodsReceiveId)
                   .HasDatabaseName("IX_GoodsReceiveItem_GoodsReceiveId");

            builder.HasIndex(e => e.PurchaseOrderItemId)
                   .HasDatabaseName("IX_GoodsReceiveItem_PurchaseOrderItemId");
        }
    }
}