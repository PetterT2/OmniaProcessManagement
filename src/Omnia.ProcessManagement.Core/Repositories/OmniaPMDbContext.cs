using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Omnia.Fx.Contexts;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Json.ContractResolvers;
using Omnia.Fx.NetCore.Repositories.EntityFramework;
using Omnia.ProcessManagement.Core.Entities;
using Omnia.ProcessManagement.Core.Entities.Images;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Entities.ProcessTemplates;
using Omnia.ProcessManagement.Core.Entities.ProcessTypes;
using Omnia.ProcessManagement.Core.Entities.ReviewReminders;
using Omnia.ProcessManagement.Core.Entities.Settings;
using Omnia.ProcessManagement.Core.Entities.ShapeTemplates;
using Omnia.ProcessManagement.Core.Entities.Workflows;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories
{
    internal class OmniaPMDbContext : DbContextWithAuditing<OmniaPMDbContext>
    {
        private static object _lock = new object();
        private ILogger<DbContextOptions> Logger { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="OmniaDMDbContext"/> class.
        /// </summary>
        public OmniaPMDbContext(DbContextOptions options, IOmniaContext omniaContext, ILogger<DbContextOptions> logger, IOmniaScopedContext omniaScopedContext)
            : base(options, omniaContext, omniaScopedContext)
        {
            Logger = logger;
            HandleStartup(OnStartupHandled);


            EnsureValidJsonConvertDefaultSettings();
        }

        private void EnsureValidJsonConvertDefaultSettings()
        {
            //Ensure CamelCaseExceptDictionaryKeysResolver before creating OmniaPMDbContext to allow to insert/update database. 
            //This is VERY important to prevent from conrupt data. 
            if (JsonConvert.DefaultSettings.Invoke().ContractResolver.GetType() != typeof(CamelCaseExceptDictionaryKeysResolver))
            {
                lock (_lock)
                {
                    if (JsonConvert.DefaultSettings.Invoke().ContractResolver.GetType() != typeof(CamelCaseExceptDictionaryKeysResolver))
                    {
                        JsonConvert.DefaultSettings = () =>
                        {
                            var contractResolver = new CamelCaseExceptDictionaryKeysResolver();
                            contractResolver.NamingStrategy.ProcessExtensionDataNames = true;
                            contractResolver.NamingStrategy.ProcessDictionaryKeys = false;
                            var settings = new JsonSerializerSettings();
                            settings.ContractResolver = contractResolver;
                            return settings;
                        };
                        //OPM should let core team know to revisit their solution if this error happens frequently
                        Logger.LogError("JsonConvert.DefaultSettings is not set to CamelCaseExceptDictionaryKeysResolver by OmniaFxConfiguration yet, so OPM handled this case. But why?");
                    }
                }
            }
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
        public DbSet<ProcessConcurrencyLock> ProcessConcurrencyLock { get; set; }
        public DbSet<ProcessTemplate> ProcessTemplates { get; set; }
        public DbSet<ProcessType> ProcessTypes { get; set; }
        public DbSet<ProcessTypeTermSynchronizationTracking> ProcessTypeTermSynchronizationTracking { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<Workflow> Workflows { get; set; }
        public DbSet<WorkflowTask> WorkflowTasks { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<ImageReference> ImageReferences { get; set; }
        public DbSet<ShapeTemplate> ShapeTemplates { get; set; }
        public DbSet<ShapeTemplateImage> ShapeTemplateImages { get; set; }
        public DbSet<ReviewReminderQueue> ReviewReminderQueues { get; set; }
        public DbSet<ProcessIdNumber> ProcessIdNumbers { get; set; }
        //Views
        public DbSet<ProcessTypeChildCount> ProcessTypeChildCountView { get; set; }
        public DbSet<AlternativeProcessEF> AlternativeProcessEFView { get; set; }
        public DbSet<AlternativeProcessEFWithoutData> AlternativeProcessEFWithoutDataView { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            SetOPMClusteredIndex<Process>(modelBuilder, c => new { c.Id });
            modelBuilder.Entity<Process>()
               .HasIndex(c => new { c.OPMProcessId, c.VersionType })
               .IsUnique()
               .HasFilter($"[VersionType] != {(int)ProcessVersionType.Archived}");

            modelBuilder.Entity<ProcessData>()
                .HasKey(pd => new { pd.ProcessStepId, pd.ProcessId });

            SetOPMClusteredIndex<ProcessData>(modelBuilder, p => new { p.ProcessStepId, p.ProcessId });
            modelBuilder.Entity<ProcessData>()
                 .HasOne(p => p.Process)
                 .WithMany(p => p.ProcessData)
                 .IsRequired(true).OnDelete(DeleteBehavior.Cascade);

            SetClusteredIndex<ProcessTemplate>(modelBuilder, d => new { d.Id });
            SetClusteredIndex<ProcessType>(modelBuilder, d => new { d.Id });
            SetClusteredIndex<ShapeTemplate>(modelBuilder, d => new { d.Id });
            modelBuilder.Entity<ProcessType>()
                .HasIndex(c => new { c.RootId })
                .IsUnique()
                .HasFilter("[ParentId] IS NULL AND [DeletedAt] IS NULL");

            SetClusteredIndex<Setting>(modelBuilder, d => new { d.Key });

            SetOPMClusteredIndex<Workflow>(modelBuilder, d => new { d.Id });
            modelBuilder.Entity<Workflow>()
               .HasIndex(c => new { c.OPMProcessId })
               .IsUnique()
               .HasFilter($"[CompletedType] = {(int)WorkflowCompletedType.None}");

            SetOPMClusteredIndex<WorkflowTask>(modelBuilder, d => new { d.Id });

            modelBuilder.Entity<ImageReference>().HasKey(i => new { i.ProcessId, i.FileName, i.ImageId });
            modelBuilder.Entity<ImageReference>()
                .HasOne(p => p.Process)
                .WithMany(p => p.ImageReferences)
                .IsRequired(true).OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ImageReference>()
                .HasOne(p => p.Image)
                .WithMany(p => p.ImageReferences)
                .IsRequired(true).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ShapeTemplateImage>().HasKey(i => new { i.Id, i.ShapeTemplateId });
            modelBuilder.Entity<ShapeTemplateImage>()
                .HasOne(s => s.ShapeTemplate)
                .WithOne().IsRequired(true).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReviewReminderQueue>()
              .HasIndex(r => new { r.OPMProcessId, r.Pending })
              .IsUnique()
              .HasFilter($"[Pending] = 1");

            modelBuilder.Entity<ProcessIdNumber>()
               .HasIndex(r => new { r.OPMProcessId })
               .IsUnique();

            modelBuilder.Entity<ProcessTypeChildCount>().ToView(nameof(ProcessTypeChildCountView)).HasNoKey();
            modelBuilder.Entity<AlternativeProcessEF>().ToView(nameof(AlternativeProcessEFView)).HasNoKey();
            modelBuilder.Entity<AlternativeProcessEFWithoutData>().ToView(nameof(AlternativeProcessEFWithoutDataView)).HasNoKey();
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
