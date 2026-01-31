using Application.Common.CQS.Queries;
using AutoMapper;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Common.Services.SecurityManager
{
    public record GetUserLocationsListDto
    {
        public string? Id { get; init; }
        public string? UserId { get; init; }
        public string? LocationId { get; init; }
        public string? LocationName { get; init; }  
        public bool IsDefaultLocation { get; init; }
        public DateTime? CreatedAtUtc { get; init; }
        public string? CreatedById { get; init; }
        public bool? IsDeleted { get; init; }
    }
    

}
