using Microsoft.EntityFrameworkCore;
using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories
{
    internal abstract class RepositoryBase<T> where T : ClusteredIndexAuditingEntityBase
    {
        protected readonly OmniaPMDbContext _dataContext;
        protected readonly DbSet<T> _dbSet;

        protected RepositoryBase(OmniaPMDbContext databaseContext)
        {
            _dataContext = databaseContext;
            _dbSet = _dataContext.Set<T>();
        }

        protected T Add(T entity)
        {
            return _dbSet.Add(entity).Entity;
        }

        protected async ValueTask<T> AddAsync(T entity)
        {
            var result = await _dbSet.AddAsync(entity);
            await _dataContext.SaveChangesAsync();

            return result.Entity;
        }

        protected IQueryable<T> Find(Expression<Func<T, bool>> predicate)
        {
            return _dbSet.Where(predicate);
        }

        protected async Task RemoveAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _dataContext.SaveChangesAsync();
        }

        protected T Update(T entity)
        {
            return _dbSet.Update(entity).Entity;
        }
    }
}
