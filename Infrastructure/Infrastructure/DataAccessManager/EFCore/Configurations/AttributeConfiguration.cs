using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;
using Attribute = Domain.Entities.Attribute;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class AttributeConfiguration : BaseEntityConfiguration<Attribute>
{
    public override void Configure(EntityTypeBuilder<Attribute> builder)
    {
        base.Configure(builder);

        // Table & primary key are handled by BaseEntityConfiguration

        builder.Property(x => x.Number)
            .HasMaxLength(CodeConsts.MaxLength)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(NameConsts.MaxLength)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(DescriptionConsts.MaxLength)
            .IsRequired(false);

        
        builder.HasIndex(e => e.Number).IsUnique(false);

        // Relationship: Attribute → AttributeDetails (1 to many)
        builder
            .HasMany(x => x.AttributeDetails)
            .WithOne(x => x.Attribute)
            .HasForeignKey(x => x.AttributeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
