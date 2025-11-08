using Domain.Common;


namespace Domain.Entities
{
    public class ProductGroupAttributes : BaseEntity // or IEntity if you have that interface
    {
        //public string Id { get; set; } = default!;
        public string ProductGroupId { get; set; } = default!;

        public string AttributeName { get; set; } = default!;
        public string? AttributeValue { get; set; }

        //public bool IsDeleted { get; set; } = false;

        //public string? CreatedBy { get; set; }
        //public DateTime CreatedAtUtc { get; set; } 

        //public string? UpdatedBy { get; set; }
        //public DateTime UpdatedAtUtc { get; set; } 

        // ✅ Optional navigation
        //public ProductGroup? ProductGroup { get; set; }

        // ✅ Add this navigation property
        public ICollection<ProductGroupAttributeValue> Values { get; set; } = new List<ProductGroupAttributeValue>();

    }
}
