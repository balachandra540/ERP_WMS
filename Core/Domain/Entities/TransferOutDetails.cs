using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class TransferOutDetails : BaseEntity
    {

        public string TransferOutId { get; set; } = default!;
        public TransferOut TransferOut { get; set; } = default!;

        public int RowIndex { get; set; }

        public string? IMEI1 { get; set; }
        public string? IMEI2 { get; set; }
        public string? ServiceNo { get; set; }

    }

}
