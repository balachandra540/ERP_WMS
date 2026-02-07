using Microsoft.EntityFrameworkCore.Storage;

namespace Application.Common.Repositories;

public interface IUnitOfWork
{
    Task SaveAsync(CancellationToken cancellationToken = default);
    Task<IDbContextTransaction> BeginTransactionAsync();

    void Save();
}
