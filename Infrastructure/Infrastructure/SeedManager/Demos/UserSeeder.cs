using Infrastructure.SecurityManager.AspNetIdentity;
using Infrastructure.SecurityManager.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.SeedManager.Demos;

//public class UserSeeder
//{
//    private readonly UserManager<ApplicationUser> _userManager;

//    public UserSeeder(UserManager<ApplicationUser> userManager)
//    {
//        _userManager = userManager;
//    }

//    public async Task GenerateDataAsync()
//    {
//        var userNames = new List<string>
//        {
//            "Alex", "Taylor", "Jordan", "Morgan", "Riley",
//            "Casey", "Peyton", "Cameron", "Jamie", "Drew",
//            "Dakota", "Avery", "Quinn", "Harper", "Rowan",
//            "Emerson", "Finley", "Skyler", "Charlie", "Sage"
//        };

//        var defaultPassword = "123456";
//        var domain = "@example.com";

//        foreach (var name in userNames)
//        {
//            var email = $"{name.ToLower()}{domain}";

//            if (await _userManager.FindByEmailAsync(email) == null)
//            {
//                var applicationUser = new ApplicationUser(email, name, "User")
//                {
//                    EmailConfirmed = true
//                };

//                await _userManager.CreateAsync(applicationUser, defaultPassword);

//                var role = RoleHelper.GetProfileRole();
//                if (!await _userManager.IsInRoleAsync(applicationUser, role))
//                {
//                    await _userManager.AddToRoleAsync(applicationUser, role);
//                }
//            }
//        }
//    }
//}
public class UserSeeder
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public UserSeeder(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task GenerateDataAsync()
    {
        var userNames = new List<string>
        {
            "Alex", "Taylor", "Jordan", "Morgan", "Riley",
            "Casey", "Peyton", "Cameron", "Jamie", "Drew",
            "Dakota", "Avery", "Quinn", "Harper", "Rowan",
            "Emerson", "Finley", "Skyler", "Charlie", "Sage"
        };

        var defaultPassword = "123456";
        var domain = "@example.com";
        var warehouse = "";
        foreach (var name in userNames)
        {
            throw new InvalidOperationException("AspNetIdentity:DefaultAdmin section is missing in appsettings.json.");
        }

            if (await _userManager.FindByEmailAsync(email) == null)
            {
                var applicationUser = new ApplicationUser(email, name, "User", warehouse)
                {
                    EmailConfirmed = true
                };

                // Create the user with the password
                var createResult = await _userManager.CreateAsync(adminUser, adminPassword);
                if (!createResult.Succeeded)
                {
                    var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create admin user: {errors}");
                }

                // Assign the "Admin" role (or use RoleHelper.GetProfileRole() if needed)
                var role = RoleHelper.GetProfileRole();
                if (!await _userManager.IsInRoleAsync(adminUser, role))
                {
                    var roleResult = await _userManager.AddToRoleAsync(adminUser, role);
                    if (!roleResult.Succeeded)
                    {
                        var roleErrors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        throw new InvalidOperationException($"Failed to assign role to admin user: {roleErrors}");
                    }
                }
            }
        }
    }
}