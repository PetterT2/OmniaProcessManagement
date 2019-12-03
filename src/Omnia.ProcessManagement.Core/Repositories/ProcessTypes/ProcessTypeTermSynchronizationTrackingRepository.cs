using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTypes
{
    internal class ProcessTypeTermSynchronizationTrackingRepository : IProcessTypeTermSynchronizationTrackingRepository
    {
        private class SimpleProcessType
        {
            public Guid Id { get; set; }
            public string Title { get; set; }
            public Guid? ParentId { get; set; }
            public Guid RootId { get; set; }
            public ProcessTypeSettingsTypes Type { get; set; }
            public DateTimeOffset ModifiedAt { get; set; }
        }

        private OmniaPMDbContext DatabaseContext { get; }
        private DbSet<Entities.ProcessTypes.ProcessTypeTermSynchronizationTracking> ProcessTypeTermSynchronizationTracking { get; }
        private DbSet<Entities.ProcessTypes.ProcessType> ProcessTypes { get; }
        public ProcessTypeTermSynchronizationTrackingRepository(OmniaPMDbContext databaseContext)
        {
            DatabaseContext = databaseContext;
            ProcessTypeTermSynchronizationTracking = databaseContext.Set<Entities.ProcessTypes.ProcessTypeTermSynchronizationTracking>();
            ProcessTypes = databaseContext.Set<Entities.ProcessTypes.ProcessType>();
        }

        public async ValueTask AddTrackingResultAsync(ProcessTypeTermSynchronizationTrackingResult result)
        {
            if (result.IsSyncFromSharePoint)
            {
                var tracking = await ProcessTypeTermSynchronizationTracking.AsTracking()
                    .Where(d => d.ProcessTypeRootId == result.ProcessTypeRootId && d.Status == ProcessTypeTermSynchronizationStatus.Statuses.Syncing && d.SyncFromSharePoint)
                    .FirstOrDefaultAsync();

                if (tracking != null)
                {
                    tracking.Status = result.Success && !result.SkippedNotAvailableWorkingLanguages ? ProcessTypeTermSynchronizationStatus.Statuses.Success :
                         result.Success && result.SkippedNotAvailableWorkingLanguages ? ProcessTypeTermSynchronizationStatus.Statuses.SkippedNotAvailableWorkingLanguages :
                        ProcessTypeTermSynchronizationStatus.Statuses.Failed;

                    tracking.Milliseconds = result.Milliseconds;
                    tracking.Message = result.Message;
                    tracking.CreatedAt = DateTimeOffset.UtcNow;
                    tracking.ModifiedAt = DateTimeOffset.UtcNow;
                }
            }
            else
            {
                var tracking = new Entities.ProcessTypes.ProcessTypeTermSynchronizationTracking();
                tracking.ProcessTypeRootId = result.ProcessTypeRootId;
                tracking.Hash = result.Hash;
                tracking.Message = result.Message;
                tracking.Status = result.Success && !result.SkippedNotAvailableWorkingLanguages ? ProcessTypeTermSynchronizationStatus.Statuses.Success :
                         result.Success && result.SkippedNotAvailableWorkingLanguages ? ProcessTypeTermSynchronizationStatus.Statuses.SkippedNotAvailableWorkingLanguages :
                        ProcessTypeTermSynchronizationStatus.Statuses.Failed;

                tracking.CreatedAt = result.LatestModifiedAt;
                tracking.Milliseconds = result.Milliseconds;

                DatabaseContext.ProcessTypeTermSynchronizationTracking.Add(tracking);
            }

            await DatabaseContext.SaveChangesAsync();
        }

        public async ValueTask<ProcessTypeTermSynchronizationTrackingRequest> GetTrackingRequestAsync(Guid rootId)
        {
            var pendingSyncFromSharePointTracking = await ProcessTypeTermSynchronizationTracking
                .Where(d => d.ProcessTypeRootId == rootId && d.Status == ProcessTypeTermSynchronizationStatus.Statuses.Syncing && d.SyncFromSharePoint)
                .FirstOrDefaultAsync();

            var request = new ProcessTypeTermSynchronizationTrackingRequest();
            request.ProcessTypeRootId = rootId;

            if (pendingSyncFromSharePointTracking != null)
            {
                request.Type = ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.PendingSyncFromSharePoint;
            }
            else
            {
                var latestTracking = await ProcessTypeTermSynchronizationTracking.AsTracking()
                .Where(d => d.ProcessTypeRootId == rootId)
                .OrderByDescending(d => d.CreatedAt).FirstOrDefaultAsync();

                var latestProcessTypeModifiedAt = await ProcessTypes.Where(d => d.RootId == rootId && d.DeletedAt == null)
                    .OrderByDescending(d => d.ModifiedAt).Select(d => d.ModifiedAt).FirstOrDefaultAsync();


                var isModified = (latestTracking == null && latestProcessTypeModifiedAt != DateTimeOffset.MinValue) ||
                    (latestTracking != null && latestTracking.CreatedAt < latestProcessTypeModifiedAt);

                if (isModified)
                {
                    await AddModifiedInfoToTrackingRequestAsync(request, latestTracking);
                }
                else
                {
                    request.Type = ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.Synced;
                }
            }
            return request;
        }

        private async ValueTask AddModifiedInfoToTrackingRequestAsync(ProcessTypeTermSynchronizationTrackingRequest request,
            Entities.ProcessTypes.ProcessTypeTermSynchronizationTracking latestTracking)
        {

            var processTypes = await ProcessTypes.Where(d => d.RootId == request.ProcessTypeRootId && d.DeletedAt == null)
                       .OrderByDescending(d => d.ClusteredId)
                       .Select(d => new SimpleProcessType
                       {
                           Id = d.Id,
                           ParentId = d.ParentId,
                           RootId = d.RootId,
                           Title = d.Title,
                           Type = d.Type,
                           ModifiedAt = d.ModifiedAt
                       })
                       .ToListAsync();

            var latestModifiedAt = processTypes.Select(d => d.ModifiedAt).Max();

            //Exclude root process type
            processTypes = processTypes.Where(d => d.ParentId != null).ToList();

            var processTypeTerms = processTypes.Select(ParseEntityToModel).ToList();
            var hash = CommonUtils.CreateMd5Hash(JsonConvert.SerializeObject(processTypeTerms));

            request.LatestModifiedAt = latestModifiedAt;
            request.ProcessTypeTerms = processTypeTerms;
            request.Hash = hash;

            //If two hashes are the same, then it mean the process types does not need to sync to Term Set
            if (latestTracking != null && latestTracking.Status == ProcessTypeTermSynchronizationStatus.Statuses.Success && hash == latestTracking.Hash)
            {
                request.Type = ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.Synced;
                latestTracking.CreatedAt = request.LatestModifiedAt;
                await DatabaseContext.SaveChangesAsync();
            }
            else if (processTypeTerms.Count == 0)
            {
                request.Type = ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.Synced;
                var result = request.CreateTrackingResult(true, false, "", 0);

                await AddTrackingResultAsync(result);
            }
            else
            {
                request.Type = ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.PendingSyncToSharePoint;
            }
        }

        public async ValueTask<ProcessTypeTermSynchronizationStatus> GetSyncStatusAsync(Guid rootId)
        {
            Entities.ProcessTypes.ProcessTypeTermSynchronizationTracking latestTracking =
                await ProcessTypeTermSynchronizationTracking
                .Where(d => d.ProcessTypeRootId == rootId)
                .OrderByDescending(d => d.CreatedAt).FirstOrDefaultAsync();

            var latestProcessTypeModifiedAt = await ProcessTypes.Where(d => d.RootId == rootId && d.DeletedAt == null)
                .OrderByDescending(d => d.ModifiedAt).Select(d => d.ModifiedAt).FirstOrDefaultAsync();

            var isSyncing = (latestTracking == null && latestProcessTypeModifiedAt != DateTimeOffset.MinValue) ||
                (latestTracking != null && !latestTracking.SyncFromSharePoint && latestTracking.CreatedAt < latestProcessTypeModifiedAt);

            var isSyncingFromSharePoint = latestTracking != null && latestTracking.SyncFromSharePoint && latestTracking.Status == ProcessTypeTermSynchronizationStatus.Statuses.Syncing;

            ProcessTypeTermSynchronizationStatus status = null;


            if (isSyncing || isSyncingFromSharePoint)
            {
                var fallBackLatestTrackingId = latestTracking != null ? latestTracking.Id : 0;

                status = new ProcessTypeTermSynchronizationStatus();
                status.LatestTrackingId = fallBackLatestTrackingId;
                status.Status = ProcessTypeTermSynchronizationStatus.Statuses.Syncing;
                status.SyncFromSharePoint = isSyncingFromSharePoint;
            }
            else if (latestTracking != null)
            {
                status = new ProcessTypeTermSynchronizationStatus();
                status.Status = latestTracking.Status;
                status.LatestTrackingId = latestTracking.Id;
                status.TotalSeconds = latestTracking.Milliseconds / 1000;
                status.LatestTrackingRunTime = latestTracking.ModifiedAt;
                status.Message = latestTracking.Message;
                status.SyncFromSharePoint = latestTracking.SyncFromSharePoint;
            }

            return status;
        }

        public async ValueTask TriggerSyncAsync(Guid rootId)
        {
            var rootProcessType = new Entities.ProcessTypes.ProcessType() { Id = rootId };
            DatabaseContext.ProcessTypes.Attach(rootProcessType);

            rootProcessType.ModifiedAt = DateTimeOffset.UtcNow;
            await DatabaseContext.SaveChangesAsync();
        }

        public async ValueTask TriggerSyncFromSharePointAsync(Guid rootId)
        {
            var anyProcessTypeExist = await DatabaseContext.ProcessTypes.AnyAsync(d => d.ParentId.HasValue && d.RootId == rootId && d.DeletedAt == null);
            if (anyProcessTypeExist)
                throw new Exception($"There are existing process types mapping to termset {rootId} in database.");

            var rootProcessType = await DatabaseContext.ProcessTypes.AsTracking().FirstOrDefaultAsync(d => d.Id == rootId && d.DeletedAt == null);
            if (rootProcessType == null)
                throw new Exception($"Root process type for termset {rootId} is not created.");


            var tracking = await ProcessTypeTermSynchronizationTracking.FirstOrDefaultAsync(d => d.ProcessTypeRootId == rootId && d.Status == ProcessTypeTermSynchronizationStatus.Statuses.Syncing);
            if (tracking == null)
            {
                tracking = new Entities.ProcessTypes.ProcessTypeTermSynchronizationTracking();
                tracking.ProcessTypeRootId = rootId;
                tracking.Status = ProcessTypeTermSynchronizationStatus.Statuses.Syncing;
                tracking.SyncFromSharePoint = true;

                ProcessTypeTermSynchronizationTracking.Add(tracking);
                rootProcessType.ModifiedAt = DateTimeOffset.UtcNow;

                await DatabaseContext.SaveChangesAsync();
            }
        }

        private ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm ParseEntityToModel(SimpleProcessType entity)
        {
            ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm model = null;
            if (entity != null)
            {
                model = new ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm();
                model.Id = entity.Id;
                model.ParentId = entity.ParentId;
                model.IsGroup = entity.Type == ProcessTypeSettingsTypes.Group;
                model.Title = string.IsNullOrWhiteSpace(entity.Title) ? new MultilingualString() : JsonConvert.DeserializeObject<MultilingualString>(entity.Title);
            }

            return model;
        }
    }
}
