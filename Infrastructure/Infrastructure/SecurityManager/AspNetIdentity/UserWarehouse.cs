using Domain.Common;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.SecurityManager.AspNetIdentity
{
    public class UserWarehouse : BaseEntity
    {

        public string UserId { get; set; } = null!;
        public string WarehouseId { get; set; } = null!;

        public bool IsDefaultLocation { get; set; }  // 🔥 ADD


        public ApplicationUser User { get; set; } = null!;
        public Warehouse Warehouse { get; set; } = null!;
    }

}
