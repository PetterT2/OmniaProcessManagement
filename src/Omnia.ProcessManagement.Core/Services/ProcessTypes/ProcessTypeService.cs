using Omnia.Fx.Caching;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.ProcessManagement.Core.Repositories.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes
{
    internal class ProcessTypeService: IProcessTypeService
    {
        internal class IdMapToParentIdCacheModel
        {
            public Guid ParentId { get; set; }
        }

        private static object _lock = new object();
        private static bool _ensuredSubscribeProcessTypesChanges = false;

        private IProcessTypeRepository ProcessTypeRepository { get; }
        private IEnterprisePropertyService EnterprisePropertyService { get; }
        private ProcessTypeValidation ProcessTypeValidation { get; }
        private IProcessTypeTermSynchronizationTrackingService TrackingService { get; }
        private IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> CacheHelper { get; }
        private IMessageBus MessageBus { get; }
        public ProcessTypeService(IProcessTypeRepository documentTypeRepository,
            IEnterprisePropertyService enterprisePropertyService,
            ProcessTypeValidation processTypeValidation,
            IProcessTypeTermSynchronizationTrackingService trackingService,
            IOmniaMemoryDependencyCache omniaMemoryDependencyCache,
            IMessageBus messageBus)
        {
            TrackingService = trackingService;
            ProcessTypeRepository = documentTypeRepository;
            EnterprisePropertyService = enterprisePropertyService;
            ProcessTypeValidation = processTypeValidation;
            MessageBus = messageBus;
            CacheHelper = omniaMemoryDependencyCache.AddKeyHelper(this);
            EnsureSubscribeProcessTypesChanges(messageBus, CacheHelper);
        }

        private static void EnsureSubscribeProcessTypesChanges(IMessageBus messageBus, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            if (!_ensuredSubscribeProcessTypesChanges)
            {
                lock (_lock)
                {
                    if (!_ensuredSubscribeProcessTypesChanges)
                    {
                        _ensuredSubscribeProcessTypesChanges = true;

                        messageBus.Subscribe(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, async (processTypes) =>
                        {
                            foreach (var processType in processTypes)
                            {
                                RemoveParentDependencyCache(processType.RootId, cacheHelper);
                            }
                            await Task.CompletedTask;
                        });
                    }
                }
            }
        }

        public async ValueTask SyncFromSharePointAsync(List<ProcessType> processTypes)
        {
            await ProcessTypeRepository.SyncFromSharePointAsync(processTypes);
        }

        public async ValueTask<IList<ProcessType>> GetChildrenAsync(Guid rootId)
        {
            var key = GetChildrenCacheKey(rootId);
            var dependency = EnsureParentDependencyCache(rootId);
            var result = await CacheHelper.Instance.GetOrSetDependencyCacheAsync<IList<ProcessType>>(key, async (cacheEntry) =>
            {
                cacheEntry.Dependencies.Add(dependency);
                var children = await ProcessTypeRepository.GetChildrenAsync(rootId);
                children.ToList().ForEach(AddOrUpdateIdToParentIdMapping);

                return children;
            });

            var documentTypes = result.Value.ToArray();

            return documentTypes;
        }

        public async ValueTask<Guid> GetProcessTypeTermSetIdAsync()
        {
            Guid termSetId = Guid.Empty;

            var (enterpriseProperties, _) = await EnterprisePropertyService.GetAllAsync();
            var opmProcessType = enterpriseProperties.Where(e => e.InternalName == OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName).FirstOrDefault();
            if (opmProcessType != null && opmProcessType.Settings != null)
            {
                var taxonomyPropertySettings = opmProcessType.Settings.CastTo<TaxonomyPropertySettings>();
                if (taxonomyPropertySettings.TermSetId != Guid.Empty)
                {
                    termSetId = taxonomyPropertySettings.TermSetId;

                    var processTypes = await GetByIdsAsync(termSetId);
                    var rootProcessType = processTypes.FirstOrDefault();
                    if (rootProcessType == null)
                    {
                        rootProcessType = new ProcessType();
                        rootProcessType.Id = termSetId;
                        var groupSettings = new ProcessTypeGroupSettings();
                        groupSettings.TermSetId = termSetId;
                        rootProcessType.Settings = groupSettings;
                        await CreateAsync(rootProcessType);
                    }
                }
            }

            return termSetId;
        }

        public async ValueTask<IList<ProcessType>> GetByIdsAsync(params Guid[] ids)
        {
            List<Guid> idsNeedToGetDirectly = new List<Guid>();
            List<ProcessType> result = new List<ProcessType>();
            foreach (var id in ids)
            {
                var idToParentIdCacheKey = GetIdMapToParentCacheKey(id);
                var parentIdModel = CacheHelper.Instance.Get<IdMapToParentIdCacheModel>(idToParentIdCacheKey);
                if (parentIdModel != null)
                {
                    var processType = GetInChildrenCacheIfExists(parentIdModel.ParentId, id);
                    if (processType != null)
                    {
                        result.Add(processType);
                        continue;
                    }
                    else
                    {
                        CacheHelper.Instance.Remove(idToParentIdCacheKey);
                    }
                }

                idsNeedToGetDirectly.Add(id);
            }


            if (idsNeedToGetDirectly.Count > 0)
            {
                var processTypes = await this.ProcessTypeRepository.GetByIdAsync(idsNeedToGetDirectly);

                foreach (var processType in processTypes)
                {
                    AddOrUpdateIdToParentIdMapping(processType);
                    result.Add(processType);
                }
            }

            return result;
        }

        public async ValueTask<ProcessType> CreateAsync(ProcessType documentType)
        {
            await ProcessTypeValidation.ValidateAsync(documentType);
            var createdProcessType = await ProcessTypeRepository.CreateAsync(documentType);
            RemoveParentDependencyCache(createdProcessType.RootId, CacheHelper);
            AddOrUpdateIdToParentIdMapping(createdProcessType);

            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, new List<ProcessType> { createdProcessType });
            await this.TrackingService.TriggerSyncAsync(documentType.Settings.TermSetId);
            return createdProcessType;
        }

        public async ValueTask<ProcessType> UpdateAsync(ProcessType processType)
        {
            var processTypeChanged = new List<ProcessType>();

            await ProcessTypeValidation.ValidateAsync(processType);
            var updatedDocumentType = await ProcessTypeRepository.UpdateAsync(processType);
            RemoveParentDependencyCache(updatedDocumentType.RootId, CacheHelper);
            processTypeChanged.Add(updatedDocumentType);

            AddOrUpdateIdToParentIdMapping(updatedDocumentType);

            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, processTypeChanged);
            await this.TrackingService.TriggerSyncAsync(updatedDocumentType.Settings.TermSetId);
            return updatedDocumentType;
        }

        public async ValueTask RemoveAsync(Guid id)
        {
            var removedProcessType = await ProcessTypeRepository.RemoveAsync(id);
            RemoveParentDependencyCache(removedProcessType.RootId, CacheHelper);

            var key = GetIdMapToParentCacheKey(removedProcessType.Id);
            CacheHelper.Instance.Remove(key);

            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, new List<ProcessType> { removedProcessType });
            await this.TrackingService.TriggerSyncAsync(removedProcessType.Settings.TermSetId);
        }

        public void RefreshCache()
        {
            var key = GetRootDependencyCacheKey();
            CacheHelper.Instance.Remove(key);
        }

        private string GetChildrenCacheKey(Guid rootId)
        {
            return CacheHelper.CreateKey("ProcessTypeChildren", rootId.ToString());
        }

        private ICacheDependencyResult<bool> EnsureParentDependencyCache(Guid parentId)
        {
            var key = GetParentDependencyCacheKey(parentId, CacheHelper);
            var rootDependency = EnsureRootDependencyCache();
            var cache = CacheHelper.Instance.GetOrSetDependencyCache<bool>(key, (cacheEntry) =>
            {
                cacheEntry.Dependencies.Add(rootDependency);
                return true;
            });

            return cache;
        }

        private ICacheDependencyResult<bool> EnsureRootDependencyCache()
        {
            var key = GetRootDependencyCacheKey();
            var cache = CacheHelper.Instance.GetOrSetDependencyCache<bool>(key, (cacheEntry) =>
            {
                return true;
            });

            return cache;
        }

        private string GetRootDependencyCacheKey()
        {
            return CacheHelper.CreateKey("RootProcessTypeDependency");
        }

        private void AddOrUpdateIdToParentIdMapping(ProcessType processType)
        {
            var key = GetIdMapToParentCacheKey(processType.Id);
            var idMapToParentIdCacheModel = new IdMapToParentIdCacheModel
            {
                ParentId = processType.RootId
            };
            CacheHelper.Instance.Set(key, idMapToParentIdCacheModel);
        }

        private string GetIdMapToParentCacheKey(Guid id)
        {
            return CacheHelper.CreateKey("MapIdToParentId", id.ToString());
        }

        private static void RemoveParentDependencyCache(Guid rootId, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            var key = GetParentDependencyCacheKey(rootId, cacheHelper);
            cacheHelper.Instance.Remove(key);
        }

        private static string GetParentDependencyCacheKey(Guid rootId, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            return cacheHelper.CreateKey("ProcessTypeParentDependency", rootId.ToString());
        }

        private ProcessType GetInChildrenCacheIfExists(Guid rootId, Guid id)
        {
            ProcessType processType = null;
            var key = GetChildrenCacheKey(rootId);
            var dependency = EnsureParentDependencyCache(rootId);
            var result = CacheHelper.Instance.Get<ICacheDependencyResult<IList<ProcessType>>>(key);
            if (result != null && result.Value != null)
            {
                var children = result.Value;
                processType = children.FirstOrDefault(c => c.Id == id);
            }

            return processType;
        }
    }
}
