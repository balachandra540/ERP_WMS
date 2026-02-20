using Microsoft.AspNetCore.Identity;

namespace Infrastructure.SecurityManager.AspNetIdentity;

public class ApplicationUserRole : IdentityUserRole<string>
{
    public long Id { get; set; }              // Your PK
    public string? UserGroupId { get; set; }  // Your new column
}
