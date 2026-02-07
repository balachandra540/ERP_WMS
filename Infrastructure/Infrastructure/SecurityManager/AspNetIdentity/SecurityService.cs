using Application.Common.Repositories;
using Application.Common.Services.EmailManager;
using Application.Common.Services.SecurityManager;
using Application.Features.SecurityManager.Queries;
using Application.Features.WarehouseManager;
using Application.Features.WarehouseManager.Commands;
using Domain.Entities;
using Infrastructure.DataAccessManager.EFCore.Contexts;
using Infrastructure.DataAccessManager.EFCore.Repositories;
using Infrastructure.SecurityManager.NavigationMenu;
using Infrastructure.SecurityManager.Roles;
using Infrastructure.SecurityManager.Tokens;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Data;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Encodings.Web;
using static Domain.Common.Constants;

namespace Infrastructure.SecurityManager.AspNetIdentity;

    public class SecurityService : ISecurityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly DataContext _context;
        private readonly IdentitySettings _identitySettings;
        private readonly IEmailService _emailService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly UpdateWarehouseLogoHandler _warehouseconfiguration;
        private readonly ICommandRepository<UserWarehouse> _userWareHouse;

    public SecurityService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        DataContext context,
        IOptions<IdentitySettings> identitySettings,
        IEmailService emailService,
        IHttpContextAccessor httpContextAccessor,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        UpdateWarehouseLogoHandler warehouseconfiguration ,// Injecting WarehouseService
        ICommandRepository<UserWarehouse> userwareHouse//,

        )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _context = context;
        _identitySettings = identitySettings.Value;
        _emailService = emailService;
        _httpContextAccessor = httpContextAccessor;
        _roleManager = roleManager;
        _configuration = configuration;
        _warehouseconfiguration = warehouseconfiguration; // Initializing WarehouseService
        _userWareHouse = userwareHouse;
       }

    public async Task<LoginResultDto> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default
        )
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            throw new Exception("Invalid login credentials.");
        }

        if (user.IsBlocked == true)
        {
            throw new Exception($"User is blocked. {email}");
        }

        if (user.IsDeleted == true)
        {
            throw new Exception($"User already deleted. {email}");
        }

        var result = await _signInManager.PasswordSignInAsync(user, password, true, lockoutOnFailure: false);

        if (result.IsLockedOut)
        {
            throw new Exception("Invalid login credentials. IsLockedOut.");
        }

        if (!result.Succeeded)
        {
            throw new Exception("Invalid login credentials. NotSucceeded.");
        }

        var accessToken = _tokenService.GenerateToken(user, null);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var roles = await _userManager.GetRolesAsync(user);

        var tokens = await _context.Token.Where(x => x.UserId == user.Id).ToListAsync(cancellationToken);
        foreach (var item in tokens)
        {
            _context.Remove(item);
        }

        var token = new Token();
        token.UserId = user.Id;
        token.RefreshToken = refreshToken;
        token.ExpiryDate = DateTime.Now.AddDays(TokenConsts.ExpiryInDays);
        token.IsDeleted = false;
        token.CreatedAtUtc = DateTime.Now;// SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
        token.CreatedById = user.Id;
        await _context.AddAsync(token, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return new LoginResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CompanyName = user.CompanyName,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            MenuNavigation = NavigationTreeStructure.GetCompleteMenuNavigationTreeNode(),
            Roles = roles.ToList(),
            Avatar = user.ProfilePictureName,
            Location = user.wareHouse,
            UserGroupId=user.UserGroupId

        };
    }

    public async Task<LogoutResultDto> LogoutAsync(
        string userId,
        CancellationToken cancellationToken = default
        )
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user != null)
        {
            var tokens = await _context.Token.Where(x => x.UserId == user.Id).ToListAsync(cancellationToken);
            foreach (var item in tokens)
            {
                _context.Remove(item);
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new LogoutResultDto
        {
            UserId = user?.Id,
            Email = user?.Email,
            FirstName = user?.FirstName,
            LastName = user?.LastName,
            CompanyName = user?.CompanyName,
            UserClaims = null,
            AccessToken = null,
            RefreshToken = null,

        };
    }
    public async Task<RegisterResultDto> RegisterAsync(
        string email,
        string password,
        string confirmPassword,
        string firstName,
        string lastName,
        string warehouse,
        string companyName = "",
        CancellationToken cancellationToken = default
        )
    {
        if (!password.Equals(confirmPassword))
        {
            throw new Exception($"Password and ConfirmPassword is different.");
        }

        var user = new ApplicationUser(
            email,
            firstName,
            lastName,
            warehouse,
            companyName            
        );

        user.EmailConfirmed = !_identitySettings.SignIn.RequireConfirmedEmail;
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        if (!await _userManager.IsInRoleAsync(user, RoleHelper.GetProfileRole()))
        {
            await _userManager.AddToRoleAsync(user, RoleHelper.GetProfileRole());
        }

        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

        if (_identitySettings.SignIn.RequireConfirmedEmail)
        {
            var request = _httpContextAccessor?.HttpContext?.Request;
            var callbackUrl = $"{request?.Scheme}://{request?.Host}/Accounts/EmailConfirm?email={user.Email}&code={code}";
            var encodeCallbackUrl = $"{HtmlEncoder.Default.Encode(callbackUrl)}";

            var emailSubject = $"Confirm your email";
            var emailMessage = $"Please confirm your account by <a href='{encodeCallbackUrl}'>clicking here</a>.";

            await _emailService.SendEmailAsync(user.Email ?? "", emailSubject, emailMessage);

        }

        return new RegisterResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CompanyName = user.CompanyName
        };
    }

    public async Task<string> ConfirmEmailAsync(
        string email,
        string code,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            throw new Exception($"Unable to load user with email: {email}");
        }

        code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        var result = await _userManager.ConfirmEmailAsync(user, code);

        if (!result.Succeeded)
        {
            throw new Exception($"Error confirming your email: {email}");
        }

        return email;
    }

    public async Task<string> ForgotPasswordAsync(
        string email,
        CancellationToken cancellationToken = default
        )
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            throw new Exception($"Unable to load user with email: {email}");
        }

        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

        var textTempPassword = Guid.NewGuid().ToString().Substring(0, _identitySettings.Password.RequiredLength);
        var encryptedTempPassword = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(textTempPassword));

        var request = _httpContextAccessor?.HttpContext?.Request;
        var callbackUrl = $"{request?.Scheme}://{request?.Host}/Accounts/ForgotPasswordConfirmation?email={user.Email}&code={code}&tempPassword={encryptedTempPassword}";
        var encodeCallbackUrl = $"{HtmlEncoder.Default.Encode(callbackUrl)}";

        var emailSubject = $"Forgot password confirmation";
        var emailMessage = $"Your temporary password is: <strong>{textTempPassword}</strong>. Please confirm reset your password by <a href='{encodeCallbackUrl}'>clicking here</a>.";

        await _emailService.SendEmailAsync(user.Email ?? "", emailSubject, emailMessage);

        return "A temporary password has been sent to the registered email address.";

    }

    public async Task<string> ForgotPasswordConfirmationAsync(
        string email,
        string tempPassword,
        string code,
        CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            throw new Exception($"Unable to load user with email: {email}");
        }

        code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
        tempPassword = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(tempPassword));
        var result = await _userManager.ResetPasswordAsync(user, code, tempPassword);

        if (!result.Succeeded)
        {
            throw new Exception($"Error resetting your password");
        }

        return email;
    }

    public async Task<RefreshTokenResultDto> RefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken
        )
    {
        var registeredToken = await _context.Token.SingleOrDefaultAsync(x => x.RefreshToken == refreshToken, cancellationToken);
        if (registeredToken == null)
        {
            throw new Exception("Refresh token invalid, please re-login");
        }
        var user = await _userManager.FindByIdAsync(registeredToken?.UserId ?? "");
        if (user == null)
        {
            throw new Exception("Refresh token invalid, please re-login");
        }
        _context.Token.Remove(registeredToken!);

        var newAccessToken = _tokenService.GenerateToken(user, null);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var roles = await _userManager.GetRolesAsync(user);

        var token = new Token();
        token.UserId = user.Id;
        token.RefreshToken = newRefreshToken;
        token.ExpiryDate = DateTime.Now.AddDays(TokenConsts.ExpiryInDays);
        token.IsDeleted = false;
        token.CreatedAtUtc = DateTime.Now;
        token.CreatedById = user.Id;
        await _context.AddAsync(token, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CompanyName = user.CompanyName,
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            MenuNavigation = NavigationTreeStructure.GetCompleteMenuNavigationTreeNode(),
            Roles = roles.ToList(),
            Avatar = user.ProfilePictureName,
            UserGroupId=user.UserGroupId
        };
    }

    public async Task<List<GetMyProfileListResultDto>> GetMyProfileListAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var profiles = await _context.Users
            .Where(x => x.Id == userId)
            .Select(x => new GetMyProfileListResultDto
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                CompanyName = x.CompanyName,
                PhoneNumber=x.PhoneNumber
            })
            .ToListAsync(cancellationToken);

        return profiles;
    }

    public async Task UpdateMyProfileAsync(
        string userId,
        string firstName,
        string lastName,
        string phoneNumber,
        string companyName,
        CancellationToken cancellationToken
        )
    {
        var user = await _context.Users.Where(x => x.Id == userId).SingleOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        user.FirstName = firstName;
        user.LastName = lastName;
        user.CompanyName = companyName;
        user.PhoneNumber = phoneNumber;
        _context.Update(user);
        await _context.SaveChangesAsync();
    }
    public async Task ChangePasswordAsync(
        string userId,
        string oldPassword,
        string newPassword,
        string confirmNewPassword,
        CancellationToken cancellationToken
    )
    {
        if (newPassword != confirmNewPassword)
        {
            throw new Exception("New password and confirm password do not match.");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        var result = await _userManager.ChangePasswordAsync(user, oldPassword, newPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Password change failed: {errors}");
        }

        var isDemoVersion = _configuration.GetValue<bool>("IsDemoVersion");
        if (isDemoVersion && user.Email == _identitySettings.DefaultAdmin.Email)
        {
            throw new Exception($"Update default admin password is not allowed in demo version.");
        }
    }

    public async Task<List<GetRoleListResultDto>> GetRoleListAsync(
        CancellationToken cancellationToken
    )
    {
        var roles = await _roleManager.Roles
            .Select(x => new GetRoleListResultDto
            {
                Id = x.Id,
                Name = x.Name ?? string.Empty
            })
            .ToListAsync(cancellationToken);

        return roles;
    }

    public async Task<List<GetUserListResultDto>> GetUserListAsync(
        CancellationToken cancellationToken
        )
    {
        var users = await _userManager.Users
            .Select(x => new GetUserListResultDto
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                IsBlocked = x.IsBlocked,
                IsDeleted = x.IsDeleted,
                EmailConfirmed = x.EmailConfirmed,
                CreatedAt = x.CreatedAt,
                wareHouse = x.wareHouse,
                UserGroupId=x.UserGroupId
            })
            .ToListAsync(cancellationToken);

        return users;
    }

    public async Task<List<GetUserLocationsListDto>> GetUserLocationListAsync(GetUserWarehouseListRequest request,
    CancellationToken cancellationToken)
    {
        //var userlocations = await _context.UserWarehouses
        //    .AsNoTracking()
        //    .Select(x => new GetUserLocationsListDto
        //    {
        //        Id = x.Id,
        //        UserId = x.UserId,
        //        LocationId = x.WarehouseId,
        //        IsDeleted = x.IsDeleted,
        //        CreatedAtUtc = x.CreatedAtUtc,
        //        CreatedById = x.CreatedById
        //    })
        //    .ToListAsync(cancellationToken);

        //return userlocations;
       // var query = _context.UserWarehouses
       //.AsNoTracking()
       //.Where(x => !x.IsDeleted);   // usually you don’t want deleted rows

       // //Apply filter only when userId is provided
       // if (!string.IsNullOrEmpty(request.UserId))
       // {
       //     query = query.Where(x => x.UserId == request.UserId);
       // }

       // var userlocations = await query
       //     .Select(x => new GetUserLocationsListDto
       //     {
       //         Id = x.Id,
       //         UserId = x.UserId,
       //         LocationId = x.WarehouseId,
       //         IsDeleted = x.IsDeleted,
       //         CreatedAtUtc = x.CreatedAtUtc,
       //         CreatedById = x.CreatedById
       //     })
       //     .ToListAsync(cancellationToken);

        var query = _context.UserWarehouses
    .Where(x => !x.IsDeleted);

        if (!string.IsNullOrEmpty(request.UserId))
        {
            query = query.Where(x => x.UserId == request.UserId);
        }

        var userlocations = await query
            .Join(_context.Warehouse,
                uw => uw.WarehouseId,
                w => w.Id,
                (uw, w) => new GetUserLocationsListDto
                {
                    Id = uw.Id,
                    UserId = uw.UserId,
                    LocationId = uw.WarehouseId,     // keep for internal use
                    LocationName = w.Name,           // display this in grid
                    IsDefaultLocation =uw.IsDefaultLocation,
                    IsDeleted = uw.IsDeleted,
                    CreatedAtUtc = uw.CreatedAtUtc,
                    CreatedById = uw.CreatedById
                })
            .ToListAsync(cancellationToken);



        return userlocations;
    }

    public async Task<CreateUserLocationsListDto> CreateUserWarehouseAsync(
    string userId,
    string locationId,
    bool isDefaultLocation,
    string createdById = "",
    CancellationToken cancellationToken = default)
    {
        var exists = await _context.UserWarehouses
            .AnyAsync(x => x.UserId == userId
                        && x.WarehouseId == locationId
                        && !x.IsDeleted, cancellationToken);

        if (exists)
            throw new Exception("Location already assigned to this user.");

        var entity = new UserWarehouse
        {
           UserId = userId,
            WarehouseId = locationId,
            IsDefaultLocation = isDefaultLocation,
            IsDeleted = false,
            CreatedAtUtc = DateTime.UtcNow,
            CreatedById = createdById
        };

        await _userWareHouse.CreateAsync(entity);
        var result = await _context.SaveChangesAsync(cancellationToken);
        Console.WriteLine("Rows affected: " + result);


        return new CreateUserLocationsListDto
        {
            UserId = entity.UserId,
            LocationId = entity.WarehouseId,
            IsDefaultLocation = entity.IsDefaultLocation,
            IsDeleted = entity.IsDeleted,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedById = entity.CreatedById
        };
    }
    public async Task<UpdateUserLocationsListDto> UpdateUserWarehouseAsync(
    string id,
    string locationId,
    bool isDefaultLocation,
    string updatedById = "",
    CancellationToken cancellationToken = default)
    {
        var entity = await _context.UserWarehouses
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity == null)
            throw new Exception($"UserLocation not found with id: {id}");

        if (entity.IsDeleted)
            throw new Exception("Cannot update a deleted user location.");

        // 🔥 If this location is being set as default,
        // unset any other default location for this user
        if (isDefaultLocation)
        {
            var previousDefaults = await _context.UserWarehouses
                .Where(x => x.UserId == entity.UserId
                            && x.Id != entity.Id
                            && x.IsDefaultLocation
                            && !x.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var item in previousDefaults)
            {
                item.IsDefaultLocation = false;
                item.UpdatedAtUtc = DateTime.UtcNow;
                item.UpdatedById = updatedById;
            }
        }
        if (isDefaultLocation)
        {
            await _context.UserWarehouses
                .Where(x => x.UserId == entity.UserId
                            && x.Id != entity.Id
                            && x.IsDefaultLocation
                            && !x.IsDeleted)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.IsDefaultLocation, false)
                    .SetProperty(x => x.UpdatedById, updatedById),
                    cancellationToken);
        }


        // Update current entity
        entity.WarehouseId = locationId;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        entity.UpdatedById = updatedById;
        entity.IsDefaultLocation = isDefaultLocation;

        _userWareHouse.Update(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return new UpdateUserLocationsListDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            LocationId = entity.WarehouseId,
            IsDefaultLocation = entity.IsDefaultLocation,
            IsDeleted = entity.IsDeleted,
            CreatedAtUtc = entity.CreatedAtUtc,
            CreatedById = entity.CreatedById
        };
    }

    public async Task<bool> DeleteUserWarehouseAsync(
    string id,
    string deletedById = "",
    CancellationToken cancellationToken = default)
    {
        var entity = await _context.UserWarehouses
            .AsTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity == null)
            throw new Exception($"UserLocation not found with id: {id}");

        if (entity.IsDeleted)
            return true;

        entity.IsDeleted = true;
        entity.UpdatedById = deletedById;

        _context.UserWarehouses.Update(entity);   // 🔥 Force EF to mark Modified

        var rows = await _context.SaveChangesAsync(cancellationToken);

        return rows > 0;
    }



    public async Task<CreateUserResultDto> CreateUserAsync(
    string email,
    string password,
    string confirmPassword,
    string firstName,
    string lastName,
    string warehouse,
    bool emailConfirmed = true,
    bool isBlocked = false,
    bool isDeleted = false,
    string createdById = "",
    string userGroupId = "", // Added parameter
    CancellationToken cancellationToken = default
    )
    {
        if (!password.Equals(confirmPassword))
        {
            throw new Exception($"Password and ConfirmPassword is different.");
        }

        // Ensure your ApplicationUser constructor is updated to accept userGroupId if necessary
        var user = new ApplicationUser(
            email,
            firstName,
            lastName,
            warehouse
        );

        user.EmailConfirmed = emailConfirmed;
        user.IsBlocked = isBlocked;
        user.IsDeleted = isDeleted;
        user.CreatedById = createdById;
        user.wareHouse = warehouse;
        user.UserGroupId = userGroupId; // Map the new field

        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        if (!await _userManager.IsInRoleAsync(user, RoleHelper.GetProfileRole()))
        {
            await _userManager.AddToRoleAsync(user, RoleHelper.GetProfileRole());
        }

        return new CreateUserResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            EmailConfirmed = user.EmailConfirmed,
            IsBlocked = user.IsBlocked,
            IsDeleted = user.IsDeleted,
            // Optional: Include UserGroupId in the result DTO if needed by the UI
        };
    }

    public async Task<UpdateUserResultDto> UpdateUserAsync(
        string userId,
        string firstName,
        string lastName,
        string warehouse = "",
        bool emailConfirmed = true,
        bool isBlocked = false,
        bool isDeleted = false,
        string updatedById = "",
        string userGroupId = "", // Added parameter
        CancellationToken cancellationToken = default
        )
    {
        var user = await _context.Users.Where(x => x.Id == userId).SingleOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        if (user.Email == _identitySettings.DefaultAdmin.Email)
        {
            throw new Exception($"Update default admin is not allowed.");
        }

        user.FirstName = firstName;
        user.LastName = lastName;
        user.EmailConfirmed = emailConfirmed;
        user.IsBlocked = isBlocked;
        user.IsDeleted = isDeleted;
        user.UpdatedById = updatedById;
        user.wareHouse = warehouse;
        user.UserGroupId = userGroupId; // Allow updating the user's group

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return new UpdateUserResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            EmailConfirmed = user.EmailConfirmed,
            IsBlocked = user.IsBlocked,
            IsDeleted = user.IsDeleted,
            wareHouse = user.wareHouse
        };
    }
    public async Task<DeleteUserResultDto> DeleteUserAsync(
        string userId,
        string deletedById = "",
        CancellationToken cancellationToken = default
        )
    {
        var user = await _context.Users.Where(x => x.Id == userId).SingleOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        if (user.Email == _identitySettings.DefaultAdmin.Email)
        {
            throw new Exception($"Update default admin is not allowed.");
        }

        user.IsDeleted = true;
        user.UpdatedById = deletedById;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return new DeleteUserResultDto
        {
            UserId = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            EmailConfirmed = user.EmailConfirmed,
            IsBlocked = user.IsBlocked,
            IsDeleted = user.IsDeleted,
        };
    }

    public async Task UpdatePasswordUserAsync(
        string userId,
        string newPassword,
        CancellationToken cancellationToken
        )
    {

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        var isDemoVersion = _configuration.GetValue<bool>("IsDemoVersion");
        if (isDemoVersion && user.Email == _identitySettings.DefaultAdmin.Email)
        {
            throw new Exception($"Update default admin password is not allowed in demo version.");
        }

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Password change failed: {errors}");
        }
    }

    public async Task<List<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default
        )
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToList();
    }

    public async Task<List<string>> UpdateUserRoleAsync(
            string userId,
            string roleName,
            bool accessGranted,
            CancellationToken cancellationToken = default
        )
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        //if (user.Email == _identitySettings.DefaultAdmin.Email)
        //{
        //    throw new Exception($"Update default admin is not allowed.");
        //}

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (accessGranted)
        {
            if (!currentRoles.Contains(roleName))
            {
                var result = await _userManager.AddToRoleAsync(user, roleName);
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to add role '{roleName}' to user with id: {userId}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }
        else
        {
            if (currentRoles.Contains(roleName))
            {
                var result = await _userManager.RemoveFromRoleAsync(user, roleName);
                if (!result.Succeeded)
                {
                    throw new Exception($"Failed to remove role '{roleName}' from user with id: {userId}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
        }

        var updatedRoles = await _userManager.GetRolesAsync(user);
        return updatedRoles.ToList();
    }



    public async Task ChangeAvatarAsync(
       string userId,
       string avatar,
       CancellationToken cancellationToken
       )
    {
        var user = await _context.Users.Where(x => x.Id == userId).SingleOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            throw new Exception($"Unable to load user with id: {userId}");
        }

        user.ProfilePictureName = avatar;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }
    }
    public DateTime? ConvertToIst(DateTime? input)
    {
        if (!input.HasValue)
            return null;

        // Get IST timezone (cross-platform)
        var istZone = TimeZoneInfo.FindSystemTimeZoneById(
            RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "India Standard Time" : "Asia/Kolkata"
        );

        var value = input.Value;

        // Ensure input is treated as UTC
        if (value.Kind != DateTimeKind.Utc)
        {
            value = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        // Convert to IST (full date + time)
        var istDateTime = TimeZoneInfo.ConvertTimeFromUtc(value, istZone);

        // Return naive timestamp (IST time values, without timezone): Kind=Unspecified
        return DateTime.SpecifyKind(istDateTime, DateTimeKind.Unspecified);
    }

    public DateTime? ConvertToIstDateOnly(DateTime? input)
    {
        // Redirect to updated ConvertToIst (now full IST timestamp, naive)
        return ConvertToIst(input);
    }

//    public async Task ChangeLogoAsync(
//    string warehouseId, // Warehouse identifier
//    string avatar,      // New profile picture or logo name
//    CancellationToken cancellationToken
//)
//    {
//        // Get the warehouse from the database using _queryContext
//        var warehouse = await _warehouseconfiguration.Set<Warehouse>()
//            .Where(x => x.Id == warehouseId)
//            .SingleOrDefaultAsync(cancellationToken);

//        // Check if the warehouse exists
//        if (warehouse == null)
//        {
//            throw new Exception($"Unable to load warehouse with id: {warehouseId}");
//        }

//        // Set the new avatar or logo (you can change property names accordingly)
//        warehouse.Logo = avatar;  // assuming `Logo` is the property name

//        // Save changes to the database
//        var result = await _warehouseconfiguration.UpdateAsync(warehouse);

//        // If the update didn't succeed, throw an error
//        if (result == 0)
//        {
//            throw new Exception("Failed to update warehouse logo.");
//        }
//    }




}

