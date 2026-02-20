using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.SecurityManager.AspNetIdentity;

public class ApplicationUserRoleConfiguration
    : IEntityTypeConfiguration<ApplicationUserRole>
{
    public void Configure(EntityTypeBuilder<ApplicationUserRole> builder)
    {
        builder.ToTable("AspNetUserRoles", "mobile_stores");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .IsRequired(false);

        builder.Property(x => x.UserGroupId)
            .IsRequired(false);

        builder.HasOne<UserGroup>()
            .WithMany()
            .HasForeignKey(x => x.UserGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
