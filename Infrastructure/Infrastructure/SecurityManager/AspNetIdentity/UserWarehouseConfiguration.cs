using Infrastructure.SecurityManager.AspNetIdentity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

public class UserWarehouseConfiguration : IEntityTypeConfiguration<UserWarehouse>
{
    public void Configure(EntityTypeBuilder<UserWarehouse> builder)
    {
        builder.ToTable("UserWarehouses", "mobile_stores");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.UserId)
            .HasMaxLength(UserIdConsts.MaxLength)
            .IsRequired();

        builder.Property(x => x.WarehouseId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.IsDeleted)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired(false);

        builder.Property(x => x.CreatedById)
            .HasMaxLength(UserIdConsts.MaxLength)
            .IsRequired(false);

        builder.Property(x => x.UpdatedAtUtc)
            .IsRequired(false);

        builder.Property(x => x.UpdatedById)
            .HasMaxLength(UserIdConsts.MaxLength)
            .IsRequired(false);

        //// Relationships
        //builder.HasOne(x => x.User)
        //    .WithMany(u => u.UserWarehouses)
        //    .HasForeignKey(x => x.UserId)
        //    .OnDelete(DeleteBehavior.Cascade);

        //builder.HasOne(x => x.Warehouse)
        //    .WithMany(w => w.UserWarehouses)
        //    .HasForeignKey(x => x.WarehouseId)
        //    .OnDelete(DeleteBehavior.Cascade);

        //// Prevent duplicate active mappings
        //builder.HasIndex(x => new { x.UserId, x.WarehouseId })
        //    .IsUnique()
        //    .HasFilter("\"IsDeleted\" = false");
    }
}
