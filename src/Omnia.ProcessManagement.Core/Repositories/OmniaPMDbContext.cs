using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.NetCore.Repositories.EntityFramework;
using System;
using System.Collections.Generic;
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
        }

        /// <summary>
        /// Executes the SQL command.
        /// </summary>
        /// <param name="sql">The SQL.</param>
        /// <param name="parameters">The parameters.</param>
        /// <returns></returns>
        public int ExecuteSqlCommand(string sql, params object[] parameters)
        {
            return this.Database.ExecuteSqlCommand(sql, parameters);
        }

        public async ValueTask<int> ExecuteSqlCommandAsync(string sql, params object[] parameters)
        {
            return await this.Database.ExecuteSqlCommandAsync(sql, parameters);
        }
    }
}
