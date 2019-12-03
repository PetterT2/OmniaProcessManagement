using Omnia.Fx.Caching;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.EnterprisePropertySets;
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
            public Guid? ParentId { get; set; }
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
            ProcessTypeValidation documentTypeValidation,
            IOmniaMemoryDependencyCache omniaMemoryDependencyCache,
            IProcessTypeTermSynchronizationTrackingService trackingService,
            IMessageBus messageBus)
        {
            TrackingService = trackingService;
            ProcessTypeRepository = documentTypeRepository;
            EnterprisePropertyService = enterprisePropertyService;
            ProcessTypeValidation = documentTypeValidation;
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

                        messageBus.Subscribe(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, async (documentTypes) =>
                        {
                            foreach (var documentType in documentTypes)
                            {
                                RemoveParentDependencyCache(documentType.ParentId, cacheHelper);
                            }
                            await Task.CompletedTask;
                        });
                    }
                }
            }
        }

        private string GetChildrenCacheKey(Guid? parentId)
        {
            var id = parentId.HasValue ? parentId.Value : Guid.Empty;
            return CacheHelper.CreateKey("ProcessTypeChildren", id.ToString());
        }

        private string GetChildCountCacheKey(Guid documentTypeId)
        {
            return CacheHelper.CreateKey("ProcessTypeChildCount", documentTypeId.ToString());
        }

        private static string GetParentDependencyCacheKey(Guid? parentId, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            var id = parentId.HasValue ? parentId.Value : Guid.Empty;
            return cacheHelper.CreateKey("ProcessTypeParentDependency", id.ToString());
        }

        private string GetRootDependencyCacheKey()
        {
            return CacheHelper.CreateKey("RootProcessTypeDependency");
        }

        private string GetIdMapToParentCacheKey(Guid id)
        {
            return CacheHelper.CreateKey("MapIdToParentId", id.ToString());
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

        private ICacheDependencyResult<bool> EnsureParentDependencyCache(Guid? parentId)
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

        private static void RemoveParentDependencyCache(Guid? parentId, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            var key = GetParentDependencyCacheKey(parentId, cacheHelper);
            cacheHelper.Instance.Remove(key);
        }

        public void RefreshCache()
        {
            var key = GetRootDependencyCacheKey();
            CacheHelper.Instance.Remove(key);
        }

        public async ValueTask SyncFromSharePointAsync(List<ProcessType> documentTypes)
        {
            await ProcessTypeRepository.SyncFromSharePointAsync(documentTypes);
            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, documentTypes);
            RefreshCache();
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
                    var documentType = GetInChildrenCacheIfExists(parentIdModel.ParentId, id);
                    if (documentType != null)
                    {
                        result.Add(documentType);
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
                var documentTypes = await this.ProcessTypeRepository.GetByIdAsync(idsNeedToGetDirectly);

                foreach (var documentType in documentTypes)
                {
                    AddOrUpdateIdToParentIdMapping(documentType);
                    result.Add(documentType);
                }
            }

            await EnsureChildCountAsync(result.ToArray());
            return result;
        }

        public async ValueTask<IList<ProcessType>> GetChildrenAsync(Guid? parentId)
        {
            var key = GetChildrenCacheKey(parentId);
            var dependency = EnsureParentDependencyCache(parentId);
            var result = await CacheHelper.Instance.GetOrSetDependencyCacheAsync<IList<ProcessType>>(key, async (cacheEntry) =>
            {
                cacheEntry.Dependencies.Add(dependency);
                var children = await ProcessTypeRepository.GetChildrenAsync(parentId);
                children.ToList().ForEach(AddOrUpdateIdToParentIdMapping);

                return children;
            });

            var documentTypes = result.Value.ToArray();
            await EnsureChildCountAsync(documentTypes);

            return documentTypes;
        }

        public async ValueTask<IList<ProcessType>> GetAllProcessTypeItemsAsync()
        {
            return await ProcessTypeRepository.GetAllProcessTypeItemsAsync();
        }

        private ProcessType GetInChildrenCacheIfExists(Guid? parentId, Guid id)
        {
            ProcessType documentType = null;
            var key = GetChildrenCacheKey(parentId);
            var dependency = EnsureParentDependencyCache(parentId);
            var result = CacheHelper.Instance.Get<ICacheDependencyResult<IList<ProcessType>>>(key);
            if (result != null && result.Value != null)
            {
                var children = result.Value;
                documentType = children.FirstOrDefault(c => c.Id == id);
            }

            return documentType;
        }

        public async ValueTask<ProcessType> CreateAsync(ProcessType processType)
        {
            await ProcessTypeValidation.ValidateAsync(processType);
            var createdProcessType = await ProcessTypeRepository.CreateAsync(processType);
            RemoveParentDependencyCache(createdProcessType.ParentId, CacheHelper);
            AddOrUpdateIdToParentIdMapping(createdProcessType);
            EnsureChildCountForCreatedProcessType(createdProcessType);

            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, new List<ProcessType> { createdProcessType });
            await this.TrackingService.TriggerSyncAsync(processType.Settings.TermSetId);
            return createdProcessType;
        }

        public async ValueTask<ProcessType> UpdateAsync(ProcessType documentType)
        {
            var documentTypeChanged = new List<ProcessType>();

            await ProcessTypeValidation.ValidateAsync(documentType);
            var (updatedProcessType, originalProcessType) = await ProcessTypeRepository.UpdateAsync(documentType);
            RemoveParentDependencyCache(updatedProcessType.ParentId, CacheHelper);
            documentTypeChanged.Add(updatedProcessType);
            if (updatedProcessType.ParentId != originalProcessType.ParentId)
            {
                RemoveParentDependencyCache(originalProcessType.ParentId, CacheHelper);
                documentTypeChanged.Add(originalProcessType);
            }

            AddOrUpdateIdToParentIdMapping(updatedProcessType);
            await EnsureChildCountAsync(updatedProcessType);

            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, documentTypeChanged);
            await this.TrackingService.TriggerSyncAsync(updatedProcessType.Settings.TermSetId);
            return updatedProcessType;
        }

        public async ValueTask RemoveAsync(Guid id)
        {
            var removedProcessType = await ProcessTypeRepository.RemoveAsync(id);
            RemoveParentDependencyCache(removedProcessType.ParentId, CacheHelper);

            var key = GetIdMapToParentCacheKey(removedProcessType.Id);
            CacheHelper.Instance.Remove(key);

            await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnProcessTypesUpdated, new List<ProcessType> { removedProcessType });
            await this.TrackingService.TriggerSyncAsync(removedProcessType.Settings.TermSetId);
        }

        private void AddOrUpdateIdToParentIdMapping(ProcessType documentType)
        {
            var key = GetIdMapToParentCacheKey(documentType.Id);
            var idMapToParentIdCacheModel = new IdMapToParentIdCacheModel
            {
                ParentId = documentType.ParentId
            };
            CacheHelper.Instance.Set(key, idMapToParentIdCacheModel);
        }

        private void EnsureChildCountForCreatedProcessType(ProcessType documentType)
        {
            var key = GetChildCountCacheKey(documentType.Id);
            //child count cache dependency should be its own id as parent id here
            var dependency = EnsureParentDependencyCache(documentType.Id);
            CacheHelper.Instance.Set(key, (int?)0, dependency);
            documentType.ChildCount = 0;
        }


        private async ValueTask EnsureChildCountAsync(params ProcessType[] documentTypes)
        {
            var needToGetChildCountProcessTypes = new List<ProcessType>();
            foreach (var documentType in documentTypes)
            {
                var key = GetChildCountCacheKey(documentType.Id);
                var childCount = CacheHelper.Instance.Get<int?>(key);

                if (childCount.HasValue)
                {
                    documentType.ChildCount = childCount.Value;
                }
                else
                {
                    needToGetChildCountProcessTypes.Add(documentType);
                }
            }

            if (needToGetChildCountProcessTypes.Count > 0)
            {
                var ids = needToGetChildCountProcessTypes.Select(d => d.Id).ToList();
                var childCounts = await ProcessTypeRepository.GetChildCountAsync(ids);

                foreach (var documentType in needToGetChildCountProcessTypes)
                {
                    var key = GetChildCountCacheKey(documentType.Id);
                    //child count cache dependency should be its own id as parent id here
                    var dependency = EnsureParentDependencyCache(documentType.Id);

                    int? childCount = 0;
                    if (childCounts.TryGetValue(documentType.Id, out int count))
                    {
                        childCount = count;
                    }
                    CacheHelper.Instance.Set(key, childCount, dependency);
                    documentType.ChildCount = childCount.Value;
                }
            }
        }
    }
}
