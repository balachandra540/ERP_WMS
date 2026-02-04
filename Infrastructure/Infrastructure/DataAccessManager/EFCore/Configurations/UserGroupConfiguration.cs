using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class UserGroupConfiguration : BaseEntityConfiguration<UserGroup>
{
    public override void Configure(EntityTypeBuilder<UserGroup> builder)
    {
        base.Configure(builder);

        // ===============================
        // BASIC FIELDS
        // ===============================

        builder.Property(x => x.Name)
            .HasMaxLength(NameConsts.MaxLength)
            .IsRequired(false);

        builder.Property(x => x.Description)
            .HasMaxLength(DescriptionConsts.MaxLength)
            .IsRequired(false);

        // ===============================
        // BUSINESS FLAGS
        // ===============================

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        
        // ===============================
        // INDEXES
        // ===============================

        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.IsActive);

        // Composite index (useful for filtering)
        builder.HasIndex(x => new
        {
            x.IsActive,
        });
    }
}
