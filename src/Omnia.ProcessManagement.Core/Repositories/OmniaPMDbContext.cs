using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.NetCore.Repositories.EntityFramework;
using Omnia.ProcessManagement.Core.Entities;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Entities.ProcessTemplates;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories
{
    internal class OmniaPMDbContext : DbContextWithAuditing<OmniaPMDbContext>
    {
        private ILogger<DbContextOptions> Logger { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="OmniaDMDbContext"/> class.
        /// </summary>
        public OmniaPMDbContext(DbContextOptions options, IOmniaContext omniaContext, ILogger<DbContextOptions> logger, IOmniaScopedContext omniaScopedContext)
            : base(options, omniaContext, omniaScopedContext)
        {
            Logger = logger;
            HandleStartup(OnStartupHandled);
        }

        protected void OnStartupHandled()
        {
            try
            {
                Database.Migrate();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error handling startup, migration or seed data", ex);
                throw ex;
            }
        }

        public DbSet<Process> Processes { get; set; }
        public DbSet<ProcessData> ProcessData { get; set; }
        public DbSet<ProcessTemplate> ProcessTemplates { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            SetOPMClusteredIndex<Process>(modelBuilder, c => new { c.Id });
            modelBuilder.Entity<Process>()
               .HasIndex(c => new { c.OPMProcessId, c.VersionType })
               .IsUnique()
               .HasFilter($"[VersionType] != {(int)ProcessVersionType.Published}");

            modelBuilder.Entity<ProcessData>()
                .HasKey(pd => new { pd.InternalProcessItemId, pd.ProcessId });

            SetOPMClusteredIndex<ProcessData>(modelBuilder, p => new { p.InternalProcessItemId, p.ProcessId });
            modelBuilder.Entity<ProcessData>()
                 .HasOne(p => p.Process)
                 .WithMany(p => p.ProcessData)
                 .IsRequired(true).OnDelete(DeleteBehavior.Restrict);
        }

        /// <summary>
        /// Executes the SQL command.
        /// </summary>
        /// <param name="sql">The SQL.</param>
        /// <param name="parameters">The parameters.</param>
        /// <returns></returns>
        public int ExecuteSqlCommand(string sql, params object[] parameters)
        {
            return this.Database.ExecuteSqlRaw(sql, parameters);
        }

        public async ValueTask<int> ExecuteSqlCommandAsync(string sql, params object[] parameters)
        {
            return await this.Database.ExecuteSqlRawAsync(sql, parameters);
        }

        private void SetOPMClusteredIndex<T>(ModelBuilder modelBuilder, Expression<Func<T, object>> primaryKeyExpression)
           where T : OPMClusteredIndexAuditingEntityBase
        {
            modelBuilder.Entity<T>()
                .HasKey(primaryKeyExpression)
                .IsClustered(clustered: false);
            modelBuilder.Entity<T>()
                .HasIndex(c => c.ClusteredId)
                .IsUnique()
                .IsClustered();
        }
    }
}
