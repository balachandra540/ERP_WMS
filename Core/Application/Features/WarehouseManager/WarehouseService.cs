using Application.Common.CQS.Queries;
using Domain.Entities;

namespace Application.Features.WarehouseManager;

public class WarehouseService
{
    private readonly IQueryContext _queryContext;

    public WarehouseService(
        IQueryContext queryContext
        )
    {
        _queryContext = queryContext;
    }


    public Warehouse? GetCustomerWarehouse()
    {
        return _queryContext.Set<Warehouse>().Where(x => x.Name == "Customer").FirstOrDefault();
    }

    public Warehouse? GetVendorWarehouse()
    {
        return _queryContext.Set<Warehouse>().Where(x => x.Name == "Vendor").FirstOrDefault();
    }

    public Warehouse? GetTransferWarehouse()
    {
        return _queryContext.Set<Warehouse>().Where(x => x.Name == "Transfer").FirstOrDefault();
    }

    public Warehouse? GetAdjustmentWarehouse()
    {
        return _queryContext.Set<Warehouse>().Where(x => x.Name == "Adjustment").FirstOrDefault();
    }

    public Warehouse? GetStockCountWarehouse()
    {
        return _queryContext.Set<Warehouse>().Where(x => x.Name == "StockCount").FirstOrDefault();
    }

    public Warehouse? GetScrappingWarehouse()
    {
        return _queryContext.Set<Warehouse>().Where(x => x.Name == "Scrapping").FirstOrDefault();
    }
//    public async Task ChangeLogoAsync(
//    string warehouseId, // Warehouse identifier
//    string avatar,      // New profile picture or logo name
//    CancellationToken cancellationToken
//)
//    {
//        // Get the warehouse from the database using _queryContext
//        var warehouse = await _queryContext.Set<Warehouse>()
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
//        var result = await _queryContext.SaveChangesAsync(cancellationToken);

//        // If the update didn't succeed, throw an error
//        if (result == 0)
//        {
//            throw new Exception("Failed to update warehouse logo.");
//        }
//    }

}
