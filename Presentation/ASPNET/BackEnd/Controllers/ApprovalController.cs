using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Application.Common.Hubs;
using Domain.Entities;
using Application.Common.Repositories;
using System;
using Microsoft.EntityFrameworkCore;  // Add if not already for EF extensions like FirstOrDefaultAsync

namespace ASPNET.BackEnd.Controllers
{
    [Route("Approvals")]
    public class ApprovalController : Controller
    {
        private readonly IHubContext<ApprovalHub> _hubContext;
        private readonly ICommandRepository<DiscountApprovalLog> _logRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ApprovalController(
            IHubContext<ApprovalHub> hubContext,
            ICommandRepository<DiscountApprovalLog> logRepository,
            IUnitOfWork unitOfWork)
        {
            _hubContext = hubContext;
            _logRepository = logRepository;
            _unitOfWork = unitOfWork;
        }

        [HttpGet("QuickAction")]
        public async Task<IActionResult> QuickAction(
            string status,
            string plu,
            string productId,
            string groupId, // 🔥 This is the SALESMAN's group ID (from email link)
            double qty,
            string token) // 🔥 Added: Token for security validation
        {
            // Basic validation
            //if (string.IsNullOrEmpty(status) || !new[] { "Approved", "Rejected" }.Contains(status))
            //{
            //    return BadRequest("Invalid status.");
            //}
            //if (string.IsNullOrEmpty(plu) || string.IsNullOrEmpty(productId) || string.IsNullOrEmpty(groupId) || qty <= 0 || string.IsNullOrEmpty(token))
            //{
            //    return BadRequest("Missing or invalid parameters.");
            //}

            // Validate token: Find the pending log with matching token (in Comments), plu, productId, qty
            var pendingLog = await _logRepository.GetQuery()
                .Where(l => l.Comments == token && l.PluCode == plu && l.ProductId == productId && l.Quantity == qty && l.Status == "Pending")
                .FirstOrDefaultAsync();

            if (pendingLog == null)
            {
                return BadRequest("Invalid or expired token.");
            }

            // Update the log (from pending to final status)
            pendingLog.ApproverName = "Manager (Via Email)";
            pendingLog.ApproverUserGroupId = null; // 🔥 UPDATED: Set to null since we don't have manager's group in email flow (or use a placeholder like "EmailApproval")
            pendingLog.Status = status;
            pendingLog.Comments = $"Actioned via Email at {DateTime.UtcNow}";
            pendingLog.ActionDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

             _logRepository.Update(pendingLog);  // Assuming UpdateAsync with token
            await _unitOfWork.SaveAsync(default);

            // 2. 🔥 CRITICAL FIX: Notify the SALESMAN (via groupId, which is Salesman's group)
            // The Hub already passed the correct groupId (Salesman's group)
            // This sends real-time notification to the salesman via SignalR
            await _hubContext.Clients.Group(groupId).SendAsync("DiscountApproved", new
            {
                pluCode = plu,
                productId = productId,
                status = status,
                approvedBy = "Manager (Email)",
                comments = pendingLog.Comments
            });

            // 3. Show confirmation to the Manager in their browser (this is just for the manager's view after clicking the link)
            string color = status == "Approved" ? "#28a745" : "#dc3545";
            return Content($@"
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Discount {status}</title>
                    <meta charset='utf-8'>
                </head>
                <body>
                    <div style='text-align:center; font-family:sans-serif; margin-top:50px;'>
                        <h2 style='color:{color};'>✅ Discount {status}!</h2>
                        <p>The system has been updated and the <strong>requester</strong> has been notified.</p>
                        <small>You can now close this tab.</small>
                    </div>
                </body>
                </html>
            ", "text/html");
        }
    }
}