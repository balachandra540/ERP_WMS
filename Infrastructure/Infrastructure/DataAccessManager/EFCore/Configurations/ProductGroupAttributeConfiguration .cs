using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations
{
    public class ProductGroupAttributeConfiguration : BaseEntityConfiguration<ProductGroupAttributes>
    {
        public override void Configure(EntityTypeBuilder<ProductGroupAttributes> builder)
        {
            builder.ToTable("ProductGroupAttributes");

            //builder.HasKey(x => x.Id);

            //builder.Property(x => x.Id)
            //    .HasMaxLength(50)
            //    .IsRequired();

            builder.Property(x => x.ProductGroupId)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.AttributeName)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(x => x.AttributeValue)
                .HasMaxLength(500);

            builder.Property(x => x.CreatedById)
                .HasMaxLength(50);

            builder.Property(x => x.UpdatedById)
                .HasMaxLength(50);

            //builder.HasOne(x => x.ProductGroup)
            //    .WithMany()
            //    .HasForeignKey(x => x.ProductGroupId)
            //    .OnDelete(DeleteBehavior.Cascade);
            //builder.Property(x => x.ProductGroupId).HasMaxLength(IdConsts.MaxLength).IsRequired(false);

        }
    }
}
