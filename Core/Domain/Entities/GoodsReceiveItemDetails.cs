using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class GoodsReceiveItemDetails : BaseEntity
    {
        public string? GoodsReceiveItemId { get; set; }
        public int RowIndex { get; set; }
        public string? IMEI1 { get; set; }
        public string? IMEI2 { get; set; }
        //public string? SerialNo { get; set; }
        public string? ServiceNo { get; set; }
        public GoodsReceiveItem GoodsReceiveItem { get; set; } = null!;


    }

}
