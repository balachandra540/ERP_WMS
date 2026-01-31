using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Common.Services.SecurityManager
{
    public record CreateUserLocationsListDto
    {
        public string? Id { get; init; }
        public string? UserId { get; init; }
        public string? LocationId { get; init; }
        public bool IsDefaultLocation { get; init; }  // 🔥 ADD

        public DateTime? CreatedAtUtc { get; init; }
        public string? CreatedById { get; init; }
        public bool? IsDeleted { get; init; }
    }
}
