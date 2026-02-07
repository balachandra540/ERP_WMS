using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.SecurityManager.AspNetIdentity;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(u => u.FirstName)
            .HasMaxLength(NameConsts.MaxLength)
            .IsRequired(false);

        builder.Property(u => u.LastName)
            .HasMaxLength(NameConsts.MaxLength)
            .IsRequired(false);

        builder.Property(u => u.ProfilePictureName)
            .HasMaxLength(NameConsts.MaxLength)
            .IsRequired(false);

        builder.Property(u => u.IsDeleted)
            .IsRequired(false);

        builder.Property(u => u.CreatedAt)
            .IsRequired(false);

        builder.Property(u => u.CreatedById)
            .HasMaxLength(UserIdConsts.MaxLength)
            .IsRequired(false);
        // ================================
        // === NEW USER GROUP CONFIG ======
        // ================================

        builder.Property(u => u.UserGroupId)
            .IsRequired(false); // Set to true if every user must belong to a group

        // Define the Foreign Key relationship
        builder.HasOne<UserGroup>()
            .WithMany() // Assuming a UserGroup has many ApplicationUsers
            .HasForeignKey(u => u.UserGroupId)
            .OnDelete(DeleteBehavior.Restrict); // Prevents deleting a group that has users
        builder.Property(u => u.UpdatedAt)
            .IsRequired(false);

        builder.Property(u => u.UpdatedById)
            .HasMaxLength(UserIdConsts.MaxLength)
            .IsRequired(false);

        builder.HasIndex(u => u.UserName);
        builder.HasIndex(u => u.Email);
        builder.HasIndex(u => u.FirstName);
        builder.HasIndex(u => u.LastName);
    }
}

