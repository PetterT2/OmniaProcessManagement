using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.NetCore.EnterpriseProperties;
using Omnia.Fx.NetCore.EnterpriseProperties.ComputedColumnMappings;
using Omnia.Fx.NetCore.EnterpriseProperties.Entities;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.EnterpriseProperties
{
    internal class EnterprisePropertyFieldProvider : EnterprisePropertyFieldProviderBase, IEnterprisePropertyFieldProvider
    {
        private IProcessRepository ProcessRepository { get; }

        public EnterprisePropertyFieldProvider(ILogger<EnterprisePropertyFieldProvider> logger,
            IProcessRepository processRepository)
            : base(logger)
        {
            ProcessRepository = processRepository;
        }

        public override async ValueTask<IDictionary<IEnterprisePropertiesEntityRepository, bool>> OnEnsureComputedColumnsSyncedAsync(
            IList<EnterprisePropertyDefinition> properties, 
            IList<EnterprisePropertyColumnMapping> mappings, 
            Func<IList<EnterprisePropertyColumnMapping>, ValueTask> syncOmniaQueryablePropertiesWithMappingsFunc)
        {
            await SyncEnterprisePropertyColumnMappingsAsync(properties, syncOmniaQueryablePropertiesWithMappingsFunc);
            await EnsurePropertyComputedColumnsAsync(properties);
            return new Dictionary<IEnterprisePropertiesEntityRepository, bool>
            {
                { ProcessRepository, true }
            };
        }

        public override async ValueTask<IDictionary<IEnterprisePropertiesEntityRepository, bool>> OnComputedColumnCreatedAsync(
            EnterprisePropertyDefinition property,
            IList<EnterprisePropertyColumnMapping> mappings)
        {
            await EnsurePropertyComputedColumnAsync(property);
            return new Dictionary<IEnterprisePropertiesEntityRepository, bool>
            {
                { ProcessRepository, true }
            };
        }

        public override async ValueTask<IDictionary<IEnterprisePropertiesEntityRepository, bool>> OnComputedColumnRemovedAsync(
            EnterprisePropertyDefinition property,
            IList<EnterprisePropertyColumnMapping> mappings)
        {
            var result = await base.OnComputedColumnRemovedAsync(property, mappings);
            return result;
        }

        protected override IList<IEnterprisePropertiesEntityRepository> GetRepositories()
        {
            return new List<IEnterprisePropertiesEntityRepository>
            {
                ProcessRepository
            };
        }

        private async ValueTask SyncEnterprisePropertyColumnMappingsAsync(IList<EnterprisePropertyDefinition> properties,
            Func<IList<EnterprisePropertyColumnMapping>, ValueTask> syncOmniaQueryablePropertiesWithMappingsFunc)
        {
            if (syncOmniaQueryablePropertiesWithMappingsFunc != null)
            {
                var currentTime = DateTimeOffset.UtcNow;
                var syncedMappings = properties
                    .Where(p => p.DeletedAt == null && ProcessRepository.ShouldAddComputedColumn(p))
                    .Select(p => new EnterprisePropertyColumnMapping
                    {
                        EnterprisePropertyId = p.Id,
                        TableName = ProcessRepository.TableName,
                        EnterprisePropertyInternalName = p.InternalName,
                        CreatedAt = currentTime
                    })
                    .ToList();
                await syncOmniaQueryablePropertiesWithMappingsFunc(syncedMappings);
            }
        }
    }
}
