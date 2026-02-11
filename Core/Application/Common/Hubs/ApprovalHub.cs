// ApprovalHub.cs (Updated with token generation for email security)
using Application.Common.Repositories;
using Application.Common.Services.EmailManager;
using Application.Common.Services.SecurityManager;
using Domain.Entities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System;

namespace Application.Common.Hubs;

public class ApprovalHub : Hub
{
    private readonly ICommandRepository<DiscountApprovalLog> _logRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISecurityService _securityService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public ApprovalHub(
        ICommandRepository<DiscountApprovalLog> logRepository,
        IUnitOfWork unitOfWork,
        ISecurityService securityService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _logRepository = logRepository;
        _unitOfWork = unitOfWork;
        _securityService = securityService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public Task JoinGroup(string userGroupId)
    {
        return Groups.AddToGroupAsync(Context.ConnectionId, userGroupId);
    }

    // 🔥 Sales Executive → Manager (Notification Phase)
    public async Task RequestInstantApproval(ApprovalRequestDto request)
    {
        // 1. ✅ FIXED: Notify the MANAGER's UI (if they are online in the system)
        await Clients.Group(request.UserGroupId).SendAsync("ReceiveApprovalRequest", (object)request);

        // 2. Send Email to Managers
        var allUsers = await _securityService.GetUserListAsync(default);
        var managers = allUsers.Where(u => u.UserGroupId == request.UserGroupId && u.IsDeleted != true).ToList();
        string baseUrl = _configuration["Kestrel:Endpoints:Http:Url"];

        // Generate a unique token for this request and log it preliminarily
        var token = Guid.NewGuid().ToString();
        var preliminaryLog = new DiscountApprovalLog
        {
            PluCode = request.PluCode,
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            Status = "Pending",
            Comments = token,  // Assuming DiscountApprovalLog has a Token property (add string Token to entity if not)
            CreatedAtUtc = DateTime.UtcNow
        };
        await _logRepository.CreateAsync(preliminaryLog, default);
        await _unitOfWork.SaveAsync(default);

        foreach (var manager in managers)
        {
            if (!string.IsNullOrEmpty(manager.Email))
            {
                string body = GetApprovalEmailHtml(manager.FirstName, request, baseUrl, token);
                await _emailService.SendEmailAsync(manager.Email, "Action Required: Discount Approval", body);
            }
        }
    }

    private string GetApprovalEmailHtml(string managerName, ApprovalRequestDto request, string baseUrl, string token)
    {
        // 🔥 CRITICAL FIX: Use RequesterGroupId (Salesman) if available.
        // If we use UserGroupId, the notification goes back to the Manager.
        // We want it to go to the Salesman.
        string targetGroupId = !string.IsNullOrEmpty(request.RequesterGroupId)
            ? request.RequesterGroupId
            : request.UserGroupId;

        // Generate secure links with the Salesman's Group ID and token
        string approveUrl = $"{baseUrl}/Approvals/QuickAction?status=Approved&plu={request.PluCode}&productId={request.ProductId}&groupId={targetGroupId}&qty={request.Quantity}&token={token}";
        string rejectUrl = $"{baseUrl}/Approvals/QuickAction?status=Rejected&plu={request.PluCode}&productId={request.ProductId}&groupId={targetGroupId}&qty={request.Quantity}&token={token}";

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
</head>
<body>
    <div style='font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
        <div style='background-color: #007bff; color: white; padding: 20px; text-align: center;'>
            <h2 style='margin: 0;'>INDOTALENT</h2>
            <p style='margin: 5px 0 0;'>Discount Approval Request</p>
        </div>
        <div style='padding: 30px; line-height: 1.6; color: #333;'>
            <p>Hello <strong>{managerName}</strong>,</p>
            <p>A new discount request requires your immediate attention:</p>
            <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                <tr style='background-color: #f8f9fa;'>
                    <td style='padding: 10px; border: 1px solid #dee2e6; font-weight: bold;'>PLU Code</td>
                    <td style='padding: 10px; border: 1px solid #dee2e6;'>{request.PluCode}</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border: 1px solid #dee2e6; font-weight: bold;'>Product ID</td>
                    <td style='padding: 10px; border: 1px solid #dee2e6;'>{request.ProductId}</td>
                </tr>
                <tr style='background-color: #f8f9fa;'>
                    <td style='padding: 10px; border: 1px solid #dee2e6; font-weight: bold;'>Quantity</td>
                    <td style='padding: 10px; border: 1px solid #dee2e6;'>{request.Quantity}</td>
                </tr>
            </table>
            <div style='text-align: center; margin-top: 30px;'>
                <a href='{approveUrl}' style='background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px; display: inline-block;'>APPROVE</a>
                <a href='{rejectUrl}' style='background-color: #dc3545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>REJECT</a>
            </div>
        </div>
        <div style='background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;'>
            <p>This is an automated request from INDOTALENT ERP System.</p>
        </div>
    </div>
</body>
</html>
";
    }

    // Manager -> Sales Executive (Response Phase - Via UI)
    public async Task RespondToApproval(ApprovalResponseDto response)
    {
        var userId = Context.UserIdentifier;
        var userName = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Manager";
        var log = new DiscountApprovalLog
        {
            PluCode = response.PluCode,
            ProductId = response.ProductId,
            Quantity = response.Quantity,
            ApproverName = response.ApproverName ?? userName,
            ApproverPhone = response.ApproverPhone ?? "",
            ApproverUserGroupId = response.UserGroupId,
            Status = response.Status,
            Comments = response.Comments,
            ActionDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified),
            CreatedById = userId,
            CreatedAtUtc = DateTime.UtcNow
        };
        await _logRepository.CreateAsync(log, default);
        await _unitOfWork.SaveAsync(default);

        // ✅ Send notification to SALESMAN's group (response.UserGroupId should be salesman's group)
        await Clients.Group(response.UserGroupId).SendAsync("DiscountApproved", new
        {
            pluCode = response.PluCode,
            productId = response.ProductId,
            status = response.Status,
            approvedBy = response.ApproverName ?? userName,
            comments = response.Comments
        });
    }
}

public class ApprovalRequestDto
{
    public string UserGroupId { get; set; } // The Manager's Group
    public string RequesterGroupId { get; set; } // 🔥 The Salesman's Group (New Field)
    public string PluCode { get; set; }
    public string ProductId { get; set; }
    public double Quantity { get; set; }
}

public class ApprovalResponseDto
{
    public string UserGroupId { get; set; } // 🔥 Should be SALESMAN's group for notification
    public string PluCode { get; set; }
    public string ProductId { get; set; }
    public double Quantity { get; set; }
    public string Status { get; set; }
    public string Comments { get; set; }
    public string ApproverName { get; set; }
    public string ApproverPhone { get; set; }
}