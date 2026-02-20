using Application.Features.SecurityManager.Queries;

namespace Application.Common.Services.SecurityManager;

public interface ISecurityService
{
    public Task<LoginResultDto> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default
        );

    public Task<LogoutResultDto> LogoutAsync(
        string userId,
        CancellationToken cancellationToken = default
        );

    public Task<RegisterResultDto> RegisterAsync(
        string email,
        string password,
        string confirmPassword,
        string firstName,
        string lastName,
        string warehouse = "",
        string companyName = "",
        CancellationToken cancellationToken = default
        );

    public Task<string> ConfirmEmailAsync(
        string email,
        string code,
        CancellationToken cancellationToken = default
        );

    public Task<string> ForgotPasswordAsync(
        string email,
        CancellationToken cancellationToken = default
        );

    public Task<string> ForgotPasswordConfirmationAsync(
        string email,
        string tempPassword,
        string code,
        CancellationToken cancellationToken = default
        );

    public Task<RefreshTokenResultDto> RefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken
        );

    public Task<List<GetMyProfileListResultDto>> GetMyProfileListAsync(
        string userId,
        CancellationToken cancellationToken
        );

    public Task UpdateMyProfileAsync(
        string userId,
        string firstName,
        string lastName,
        string phoneNumber,
        string companyName,
        CancellationToken cancellationToken
        );

    public Task ChangePasswordAsync(
        string userId,
        string oldPassword,
        string newPassword,
        string confirmNewPassword,
        CancellationToken cancellationToken
        );

    public Task<List<GetRoleListResultDto>> GetRoleListAsync(
        CancellationToken cancellationToken
        );

    public Task<List<GetUserListResultDto>> GetUserListAsync(
        CancellationToken cancellationToken
        );
    public Task<List<GetUserLocationsListDto>> GetUserLocationListAsync(GetUserWarehouseListRequest request,
       CancellationToken cancellationToken
       );
    public Task<CreateUserLocationsListDto> CreateUserWarehouseAsync(string userId, string warehouseId,bool isDefaultLocation, string createdById, CancellationToken ct);
    public Task<UpdateUserLocationsListDto> UpdateUserWarehouseAsync(string id, string warehouseId,bool isDefaultLocation, string updatedById, CancellationToken ct);
    public Task<bool> DeleteUserWarehouseAsync(string id, string deletedById, CancellationToken ct);

    public Task<CreateUserResultDto> CreateUserAsync(
    string email,
    string password,
    string confirmPassword,
    string firstName,
    string lastName,
    string wareHouse = "",
    bool emailConfirmed = true,
    bool isBlocked = false,
    bool isDeleted = false,
    string createdById = "",
    string userGroupId = "", // Placed before CancellationToken
    CancellationToken cancellationToken = default
    );

    public Task<UpdateUserResultDto> UpdateUserAsync(
        string userId,
        string firstName,
        string lastName,
        string wareHouse = "",
        bool emailConfirmed = true,
        bool isBlocked = false,
        bool isDeleted = false,
        string updatedById = "",
        string userGroupId = "", // Placed before CancellationToken
        CancellationToken cancellationToken = default
        );
    public Task<DeleteUserResultDto> DeleteUserAsync(
        string userId,
        string deletedById = "",
        CancellationToken cancellationToken = default
        );

    public Task UpdatePasswordUserAsync(
        string userId,
        string newPassword,
        CancellationToken cancellationToken
        );

    // Direct user roles (Identity)
    Task<List<string>> GetUserRolesAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<List<string>> UpdateUserRoleAsync(
        string userId,
        string roleName,
        bool accessGranted,
        CancellationToken cancellationToken = default);
    // UserGroup roles (Custom table)
    Task<List<string>> GetUserGroupRolesAsync(
        string userGroupId,
        CancellationToken cancellationToken = default);

    Task<List<string>> UpdateUserGroupRoleAsync(
        string userGroupId,
        string roleName,
        bool accessGranted,
        CancellationToken cancellationToken = default);


    public Task ChangeAvatarAsync(
        string userId,
        string avatar,
        CancellationToken cancellationToken
        );

    DateTime? ConvertToIst(DateTime? input);

    /// <summary>
    /// Converts a DateTime? input (assumed UTC) to IST date-only (midnight IST, Kind=Unspecified).
    /// For 'date' columns like ReceiveDate.
    /// </summary>
    DateTime? ConvertToIstDateOnly(DateTime? input);
}
