using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Common;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using static Domain.Common.Constants;

namespace Infrastructure.DataAccessManager.EFCore.Configurations;

public class AttributeDetailConfiguration : BaseEntityConfiguration<AttributeDetail>
{
    public override void Configure(EntityTypeBuilder<AttributeDetail> builder)
    {
        base.Configure(builder);

        builder.Property(x => x.AttributeId)
            .HasMaxLength(IdConsts.MaxLength)
            .IsRequired();

        
        builder.Property(x => x.Value)
            .HasMaxLength(DescriptionConsts.MaxLength)
            .IsRequired(false);

         }
}
