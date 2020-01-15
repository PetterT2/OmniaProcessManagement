using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Queries;
using Omnia.Fx.NetCore.EnterpriseProperties.ComputedColumnMappings;
using Omnia.Fx.NetCore.Utils.Query;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Helpers.Processes;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.CanvasDefinitions;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.Images;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    internal class ProcessRepository : BaseEnterprisePropertiesEntityRepository, IProcessRepository
    {
        #region Internal Classes
        internal class ProcessDataIdHash
        {
            public Guid Id { get; set; }
            public string Hash { get; set; }
        }
        internal class ProcessWithProcessDataIdHash
        {
            public Entities.Processes.Process Process { get; set; }
            public List<ProcessDataIdHash> AllProcessDataIdHash { get; set; }
        }

        internal class ProcessContentHash
        {
            public string Title { get; set; }
            public string Content { get; set; }
        }
        #endregion

        IOmniaContext OmniaContext { get; }
        OmniaPMDbContext DbContext { get; }
        public ProcessRepository(OmniaPMDbContext databaseContext, IOmniaContext omniaContext) :
            base(databaseContext, nameof(OmniaPMDbContext.Processes), nameof(Entities.Processes.Process.EnterpriseProperties))
        {
            OmniaContext = omniaContext;
            DbContext = databaseContext;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel)
        {
            EnsureSystemEnterpriseProperties(actionModel.Process.RootProcessStep.EnterpriseProperties, 0, 0);

            var process = new Entities.Processes.Process();
            process.Id = actionModel.Process.Id;
            DbContext.Processes.Add(process);

            var processDataDict = actionModel.ProcessData;
            AddProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessStep, processDataDict);

            process.OPMProcessId = Guid.NewGuid();
            process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep.EnterpriseProperties);
            process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep);
            process.CreatedBy = OmniaContext.Identity.LoginName;
            process.ModifiedBy = OmniaContext.Identity.LoginName;
            process.CreatedAt = DateTimeOffset.UtcNow;
            process.ModifiedAt = DateTimeOffset.UtcNow;
            process.TeamAppId = actionModel.Process.TeamAppId;

            await DatabaseContext.SaveChangesAsync();

            var model = MapEfToModel(process);
            return model;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(Guid opmProcessId)
        {
            return await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
            {
                var draftProcess = await DbContext.Processes
                .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Draft)
                .FirstOrDefaultAsync();

                if (draftProcess == null)
                {
                    var publishedProcess = await DbContext.Processes
                   .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Published)
                   .FirstOrDefaultAsync();

                    if (publishedProcess == null)
                    {
                        throw new ProcessPublishedVersionNotFoundException(opmProcessId);
                    }

                    EnsureNoActiveWorkflow(publishedProcess);

                    draftProcess = await CloneProcessAsync(publishedProcess, ProcessVersionType.Draft);
                }

                var model = MapEfToModel(draftProcess);
                return model;
            });
        }

        public async ValueTask DeleteDraftProcessAsync(Guid opmProcessId)
        {
            await InitConcurrencyLockForActionAsync<bool>(opmProcessId, async () =>
            {
                var checkedOutProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.CheckedOut, true);

                if (checkedOutProcess != null && checkedOutProcess.CheckedOutBy.ToLower() != this.OmniaContext.Identity.LoginName)
                {
                    throw new ProcessCheckedOutByAnotherUserException(checkedOutProcess.CheckedOutBy);
                }

                var draftProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.Draft, true);

                if (draftProcess == null)
                {
                    throw new ProcessDraftVersionNotFoundException(opmProcessId);
                }

                EnsureNoActiveWorkflow(draftProcess);

                if (checkedOutProcess != null)
                {
                    DbContext.Processes.Remove(checkedOutProcess);
                }
                if (draftProcess != null)
                {
                    DbContext.Processes.Remove(draftProcess);
                }

                await DbContext.SaveChangesAsync();

                var rawSql = GenerateDeleteRelatedWorkflowRawSql(opmProcessId);
                await DbContext.ExecuteSqlCommandAsync(rawSql);

                return true;
            });
        }

        private void AddProcessDataRecursive(Guid processId, ProcessStep processStep, Dictionary<Guid, ProcessData> processDataDict)
        {
            if (processDataDict.TryGetValue(processStep.Id, out var processData) && processData != null)
            {
                var refrerenceProcessStepIds = GetReferenceProcessStepIds(processData);

                var processDataEf = new Entities.Processes.ProcessData();
                processDataEf.ProcessStepId = processStep.Id;
                processDataEf.ProcessId = processId;
                processDataEf.JsonValue = JsonConvert.SerializeObject(new InternalProcessData(processData));
                processDataEf.ReferenceProcessStepIds = refrerenceProcessStepIds;
                processDataEf.Hash = CommonUtils.CreateMd5Hash(processDataEf.JsonValue);
                processDataEf.CreatedBy = OmniaContext.Identity.LoginName;
                processDataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                processDataEf.CreatedAt = DateTimeOffset.UtcNow;
                processDataEf.ModifiedAt = DateTimeOffset.UtcNow;

                processStep.ProcessDataHash = processDataEf.Hash;

                DbContext.ProcessData.Add(processDataEf);
            }
            else
            {
                throw new ProcessDataNotFoundException(processStep.Id);
            }

            if (processStep.ProcessSteps != null)
            {
                foreach (var childProcessStep in processStep.ProcessSteps)
                {
                    AddProcessDataRecursive(processId, childProcessStep, processDataDict);
                }
            }
        }

        public async ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId)
        {
            return await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
            {
                var checkedOutProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.CheckedOut, false);
                if (checkedOutProcess != null)
                {
                    if (checkedOutProcess.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                    {
                        throw new ProcessCheckedOutByAnotherUserException(checkedOutProcess.CheckedOutBy);
                    }
                    throw new Exception("There is a checked out version for this process");
                }

                var publishedProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.Published, true);
                var draftProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.Draft, true);


                if (draftProcess == null)
                {
                    throw new ProcessDraftVersionNotFoundException(opmProcessId);
                }



                draftProcess.CheckedOutBy = "";
                draftProcess.VersionType = ProcessVersionType.Published;
                draftProcess.ProcessWorkingStatus = ProcessWorkingStatus.SyncingToSharePoint;

                RootProcessStep rootProcessStep = JsonConvert.DeserializeObject<RootProcessStep>(draftProcess.JsonValue);

                var edition = 1;
                var revision = 0;

                if (publishedProcess != null)
                {
                    publishedProcess.VersionType = ProcessVersionType.Archived;

                    var (latestEdition, latestRevision) = ProcessVersionHelper.GetEditionAndRevision(publishedProcess);
                    edition = isRevision ? latestEdition : latestEdition + 1;
                    revision = isRevision ? latestRevision + 1 : 0;
                }

                EnsureSystemEnterpriseProperties(rootProcessStep.EnterpriseProperties, edition, revision);

                rootProcessStep.Comment = comment;
                draftProcess.JsonValue = JsonConvert.SerializeObject(rootProcessStep);
                draftProcess.EnterpriseProperties = JsonConvert.SerializeObject(rootProcessStep.EnterpriseProperties);

                draftProcess.SecurityResourceId = securityResourceId;

                await DbContext.SaveChangesAsync();

                var rawSql = GenerateUpdateRelatedWorkflowEditionRawSql(opmProcessId, edition);
                await DbContext.ExecuteSqlCommandAsync(rawSql);

                var process = MapEfToModel(draftProcess);
                return process;
            });
        }

        public async ValueTask<Process> UnpublishProcessAsync(Guid opmProcessId)
        {
            return await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
            {
                var publishedProcess = await DbContext.Processes.AsTracking().Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Published).FirstOrDefaultAsync();
                var draftProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.Draft, true);

                if (draftProcessWithProcessDataIdHash != null)
                {
                    throw new ProcessDraftVersionExists(opmProcessId);
                }

                publishedProcess.ProcessWorkingStatus = ProcessWorkingStatus.Archiving;

                await DbContext.SaveChangesAsync();
                var process = MapEfToModel(publishedProcess);

                return process;
            });
        }

        public async ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel)
        {
            var checkedOutProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(actionModel.Process.OPMProcessId, ProcessVersionType.CheckedOut, true);
            if (checkedOutProcessWithProcessDataIdHash == null)
            {
                throw new ProcessCheckedOutVersionNotFoundException(actionModel.Process.OPMProcessId);
            }
            else if (checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException(checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy);
            }
            else if (actionModel.Process.Id != checkedOutProcessWithProcessDataIdHash.Process.Id)
            {
                throw new ProcessNotFoundException(actionModel.Process.Id);
            }

            var (edition, revision) = ProcessVersionHelper.GetEditionAndRevision(checkedOutProcessWithProcessDataIdHash.Process);
            EnsureSystemEnterpriseProperties(actionModel.Process.RootProcessStep.EnterpriseProperties, edition, revision);

            var existingProcessDataDict = checkedOutProcessWithProcessDataIdHash.AllProcessDataIdHash.ToDictionary(p => p.Id, p => p);
            var newProcessDataDict = actionModel.ProcessData;

            var usingProcessDataIdHashSet = new HashSet<Guid>();

            UpdateProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessStep, existingProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
            RemoveOldProcessData(actionModel.Process.Id, existingProcessDataDict, usingProcessDataIdHashSet);

            checkedOutProcessWithProcessDataIdHash.Process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep);
            checkedOutProcessWithProcessDataIdHash.Process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep.EnterpriseProperties);
            checkedOutProcessWithProcessDataIdHash.Process.ModifiedAt = DateTimeOffset.UtcNow;
            checkedOutProcessWithProcessDataIdHash.Process.ModifiedBy = OmniaContext.Identity.LoginName;

            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutProcessWithProcessDataIdHash.Process);
            return process;
        }

        public async ValueTask<Process> CheckInProcessAsync(Guid opmProcessId)
        {
            return await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
            {
                var checkedOutProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.CheckedOut, true);

                if (checkedOutProcess == null)
                {
                    throw new ProcessCheckedOutVersionNotFoundException(opmProcessId);
                }
                else if (checkedOutProcess.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                {
                    throw new ProcessCheckedOutByAnotherUserException(checkedOutProcess.CheckedOutBy);
                }

                var existingDraftProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.Draft, true);
                if (existingDraftProcess != null)
                {
                    DbContext.Processes.Remove(existingDraftProcess);
                }

                checkedOutProcess.VersionType = ProcessVersionType.Draft;
                checkedOutProcess.CheckedOutBy = "";
                checkedOutProcess.ModifiedAt = DateTimeOffset.UtcNow;
                checkedOutProcess.ModifiedBy = OmniaContext.Identity.LoginName;

                await DbContext.SaveChangesAsync();

                var process = MapEfToModel(checkedOutProcess);
                return process;
            });
        }

        public async ValueTask UpdateDraftProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, bool allowEixstingCheckedOutVersion)
        {
            await InitConcurrencyLockForActionAsync<bool>(opmProcessId, async () =>
            {
                var process = DbContext.Processes.AsTracking().Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Draft).FirstOrDefault();
                if (process == null)
                {
                    throw new ProcessDraftVersionNotFoundException(opmProcessId);
                }


                var checkedOutVersion = await DbContext.Processes.Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.CheckedOut).FirstOrDefaultAsync();
                if (checkedOutVersion != null)
                {
                    if (checkedOutVersion.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                    {
                        throw new ProcessCheckedOutByAnotherUserException(checkedOutVersion.CheckedOutBy);
                    }

                    if (!allowEixstingCheckedOutVersion)
                    {
                        throw new Exception("There is a checked out version for this process");
                    }
                }

                EnsureValidProcessWorkingStatusForDraftProcess(opmProcessId, process.ProcessWorkingStatus, newProcessWorkingStatus);

                process.ProcessWorkingStatus = newProcessWorkingStatus;

                await DbContext.SaveChangesAsync();

                return true;
            });
        }

        public async ValueTask UpdatePublishedProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus)
        {
            await InitConcurrencyLockForActionAsync<bool>(opmProcessId, async () =>
            {

                var process = DbContext.Processes.AsTracking().Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Published).FirstOrDefault();
                if (process == null)
                {
                    throw new ProcessPublishedVersionNotFoundException(opmProcessId);
                }

                EnsureValidProcessWorkingStatusForPublishedProcess(opmProcessId, process.ProcessWorkingStatus, newProcessWorkingStatus);
                process.ProcessWorkingStatus = newProcessWorkingStatus;

                await DbContext.SaveChangesAsync();

                return true;
            });
        }

        public async ValueTask UpdatePublishedProcessWorkingStatusAndVersionTypeAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, ProcessVersionType newVersionType)
        {
            await InitConcurrencyLockForActionAsync<bool>(opmProcessId, async () =>
            {

                var process = DbContext.Processes.AsTracking().Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Published).FirstOrDefault();
                if (process == null)
                {
                    throw new ProcessPublishedVersionNotFoundException(opmProcessId);
                }

                EnsureValidProcessWorkingStatusForPublishedProcess(opmProcessId, process.ProcessWorkingStatus, newProcessWorkingStatus);

                process.ProcessWorkingStatus = newProcessWorkingStatus;
                process.VersionType = newVersionType;

                await DbContext.SaveChangesAsync();

                return true;
            });
        }

        public async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQueryHelper itemQuery, string securityTrimmingQuery)
        {
            var result = new ItemQueryResult<Process>();

            var filterBeginStr = "WHERE (";
            result.Total = 0;
            if (itemQuery.IncludeTotal)
            {
                var (queryWithoutSortingAndPaging, queryTotalParameters) = itemQuery.GetQueryWithoutSortingAndPaging(OPMConstants.Database.Tables.Processes, excludeDeleted:false);
                queryWithoutSortingAndPaging = queryWithoutSortingAndPaging.Insert(queryWithoutSortingAndPaging.LastIndexOf(filterBeginStr) + filterBeginStr.Length, securityTrimmingQuery + " AND ");
                if (!string.IsNullOrWhiteSpace(queryWithoutSortingAndPaging))
                {
                    result.Total = await DbContext.AlternativeProcessEFView
                        .FromSqlRaw(queryWithoutSortingAndPaging, queryTotalParameters.ToArray())
                        .CountAsync();
                }
            }
            var (query, parameters) = itemQuery.GetQuery(OPMConstants.Database.Tables.Processes, excludeDeleted:false);
            query = query.Insert(query.LastIndexOf(filterBeginStr) + filterBeginStr.Length, securityTrimmingQuery + " AND ");
            if (!string.IsNullOrWhiteSpace((string)query))
            {
                var temp = await DbContext.AlternativeProcessEFView.FromSqlRaw(query, parameters.ToArray()).ToListAsync();

                result.Items = new List<Process>();
                temp.ForEach(p => result.Items.Add(MapEfToModel(p)));
            }
            return result;
        }

        private async ValueTask<T> InitConcurrencyLockForActionAsync<T>(Guid opmProcessId, Func<ValueTask<T>> action)
        {
            try
            {
                if (DbContext.Database.CurrentTransaction == null)
                {
                    using (var transaction = DbContext.Database.BeginTransaction())
                    {
                        try
                        {
                            var concurrencyLock = new Entities.Processes.ProcessConcurrencyLock { OPMProcessId = opmProcessId };
                            DbContext.ProcessConcurrencyLock.Add(concurrencyLock);
                            await DbContext.SaveChangesAsync();

                            var result = await action();

                            DbContext.ProcessConcurrencyLock.Remove(concurrencyLock);
                            await DbContext.SaveChangesAsync();

                            transaction.Commit();
                            return result;
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync();
                            throw;
                        }
                    }
                }
                else
                {
                    var concurrencyLock = new Entities.Processes.ProcessConcurrencyLock { OPMProcessId = opmProcessId };
                    DbContext.ProcessConcurrencyLock.Add(concurrencyLock);
                    await DbContext.SaveChangesAsync();

                    var result = await action();

                    DbContext.ProcessConcurrencyLock.Remove(concurrencyLock);
                    await DbContext.SaveChangesAsync();

                    return result;
                }
            }
            catch (DbUpdateException exception)
            {
                var processConcurrencyLocked = exception.InnerException != null &&
                    (exception.InnerException is SqlException) &&
                    (exception.InnerException as SqlException).Number == 2627 &&
                    (exception.InnerException as SqlException).Message.Contains("PK_ProcessConcurrencyLock");

                var timeout = exception.InnerException != null &&
                    (exception.InnerException is SqlException) &&
                    (exception.InnerException as SqlException).Number == -2;

                if (processConcurrencyLocked || timeout)
                {
                    throw new Exception("Retry later!");
                }
                throw;
            }

        }

        private string GetReferenceProcessStepIds(ProcessData processData)
        {
            var referenceProcessStepIds = "";

            if (processData.CanvasDefinition != null && processData.CanvasDefinition.DrawingShapes != null)
            {
                var processStepIds =
                    processData.CanvasDefinition.DrawingShapes.Where(s => s.Type == Models.CanvasDefinitions.DrawingShapeTypes.ProcessStep)
                    .Select(s => s.Cast<DrawingShape, ProcessStepDrawingShape>().ProcessStepId);

                referenceProcessStepIds = string.Join(',', processStepIds);
            }

            return referenceProcessStepIds;
        }

        private void RemoveOldProcessData(Guid processId, Dictionary<Guid, ProcessDataIdHash> existingProcessDataDict, HashSet<Guid> usingProcessDataIdHashSet)
        {
            foreach (var existingProcessContent in existingProcessDataDict)
            {
                if (!usingProcessDataIdHashSet.Contains(existingProcessContent.Key))
                {
                    RemoveProcessData(existingProcessContent.Key, processId);
                }
            }
        }

        private void UpdateProcessDataRecursive(Guid processId, ProcessStep processStep,
                Dictionary<Guid, ProcessDataIdHash> existingProcessDataIdHashDict,
                Dictionary<Guid, ProcessData> newProcessDataDict,
                HashSet<Guid> usingProcessDataIdHashSet)
        {
            var newProcesData = newProcessDataDict.GetValueOrDefault(processStep.Id);
            var existingProcessDataIdHash = existingProcessDataIdHashDict.GetValueOrDefault(processStep.Id);


            if (newProcesData == null)
            {
                if (existingProcessDataIdHash == null)
                {
                    throw new ProcessDataNotFoundException(processStep.Id);
                }

                processStep.ProcessDataHash = existingProcessDataIdHash.Hash;
            }
            else
            {
                if (usingProcessDataIdHashSet.Contains(processStep.Id))
                {
                    throw new ProcessDataDuplicatedException(processStep.Id);
                }

                Entities.Processes.ProcessData processDataEf = null;
                if (existingProcessDataIdHash == null)
                {
                    processDataEf = new Entities.Processes.ProcessData();
                    DbContext.ProcessData.Add(processDataEf);

                    processDataEf.ProcessStepId = processStep.Id;
                    processDataEf.ProcessId = processId;
                    processDataEf.CreatedAt = DateTimeOffset.UtcNow;
                    processDataEf.CreatedBy = OmniaContext.Identity.LoginName;
                }
                else
                {
                    processDataEf = new Entities.Processes.ProcessData { ProcessStepId = processStep.Id, ProcessId = processId };
                    DbContext.ProcessData.Attach(processDataEf);
                }
                var referenceProcessStepIds = GetReferenceProcessStepIds(newProcesData);

                processDataEf.ReferenceProcessStepIds = referenceProcessStepIds;
                processDataEf.JsonValue = JsonConvert.SerializeObject(new InternalProcessData(newProcesData));
                processDataEf.Hash = CommonUtils.CreateMd5Hash(processDataEf.JsonValue);
                processStep.ProcessDataHash = processDataEf.Hash;

                if (existingProcessDataIdHash == null || existingProcessDataIdHash.Hash != processDataEf.Hash)
                {
                    processDataEf.ModifiedAt = DateTimeOffset.UtcNow;
                    processDataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                }
            }

            usingProcessDataIdHashSet.Add(processStep.Id);

            if (processStep.ProcessSteps != null)
            {
                foreach (var childProcessStep in processStep.ProcessSteps)
                {
                    UpdateProcessDataRecursive(processId, childProcessStep, existingProcessDataIdHashDict, newProcessDataDict, usingProcessDataIdHashSet);
                }
            }

        }



        private void RemoveProcessData(Guid id, Guid processId)
        {
            var processDataEf = new Entities.Processes.ProcessData { ProcessStepId = id, ProcessId = processId };
            DbContext.ProcessData.Attach(processDataEf);
            DbContext.ProcessData.Remove(processDataEf);
        }

        public async ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            var processData = await DbContext.ProcessData
                .Where(p => p.ProcessStepId == processStepId && p.Hash == hash && p.Process.VersionType == versionType)
                .OrderByDescending(p => p.ClusteredId)
                .FirstOrDefaultAsync();

            if (processData == null)
            {
                throw new ProcessDataNotFoundException(processStepId);
            }

            var model = MapEfToModel(processData);
            return model;
        }

        public async ValueTask<Process> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType)
        {
            if (versionType == ProcessVersionType.Archived)
                throw new Exception("Not supported get published version");

            var process = await DbContext.Processes
                    .Where(p => p.ProcessData.Any(p => p.ProcessStepId == processStepId) && p.VersionType == versionType)
                    .FirstOrDefaultAsync();

            if (process == null)
            {
                throw new ProcessDataNotFoundException(processStepId);
            }

            var model = MapEfToModel(process);
            return model;
        }

        public async ValueTask<List<Process>> GetProcessesByWorkingStatusAsync(ProcessWorkingStatus processWorkingStatus, DraftOrPublishedVersionType versionType)
        {
            var processes = new List<Process>();
            var processVersionType = (ProcessVersionType)versionType;
            var processEfs = await DbContext.Processes.Where(p => p.ProcessWorkingStatus == processWorkingStatus && p.VersionType == processVersionType).ToListAsync();

            processEfs.ForEach(p => processes.Add(MapEfToModel(p)));

            return processes;
        }

        public async ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsedAsync(Guid processId, List<Guid> deletingProcessStepIds)
        {
            var remaningReferenceProcessStepIds = await DbContext.ProcessData
                .Where(p => p.ProcessId == processId && !deletingProcessStepIds.Contains(p.ProcessStepId))
                .Select(p => p.ReferenceProcessStepIds)
                .ToListAsync();

            var remaningReferenceProcessStepIdsHashSet = new HashSet<Guid>();
            foreach (var remaningReferenceProcessStepId in remaningReferenceProcessStepIds)
            {
                if (!string.IsNullOrWhiteSpace(remaningReferenceProcessStepId))
                {
                    remaningReferenceProcessStepId.Split(',').ToList().ForEach(id => remaningReferenceProcessStepIdsHashSet.Add(new Guid(id)));
                }
            }

            var beingUsed = deletingProcessStepIds.Any(id => remaningReferenceProcessStepIdsHashSet.Contains(id));

            return beingUsed;
        }

        public async ValueTask<Process> GetProcessByIdAsync(Guid processId)
        {
            var process = await DbContext.Processes
                    .Where(p => p.Id == processId)
                    .FirstOrDefaultAsync();

            if (process == null)
            {
                throw new ProcessNotFoundException(processId);
            }

            var model = MapEfToModel(process);
            return model;
        }

        public async ValueTask<Process> GetProcessByOPMProcessIdAsync(Guid opmProcessId, DraftOrPublishedVersionType versionType)
        {
            var processVersionType = (ProcessVersionType)versionType;
            var process = await DbContext.Processes
                    .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == processVersionType)
                    .FirstOrDefaultAsync();

            if (process == null)
            {
                if (versionType == DraftOrPublishedVersionType.Draft)
                {
                    throw new ProcessDraftVersionNotFoundException(opmProcessId);
                }
                else
                {
                    throw new ProcessPublishedVersionNotFoundException(opmProcessId);
                }
            }

            var model = MapEfToModel(process);
            return model;
        }

        public async ValueTask<bool> CheckIfDraftExist(Guid opmProcessId)
        {
            var process = await DbContext.Processes
                    .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Draft)
                    .FirstOrDefaultAsync();
            return process != null ? true : false;
        }

        public async ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            return await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
            {
                var draftProcess = await DbContext.Processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Draft)
                       .SingleOrDefaultAsync();

                var checkedOutProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.CheckedOut, true);

                if (checkedOutProcess == null)
                {
                    throw new ProcessCheckedOutVersionNotFoundException(opmProcessId);
                }
                else if (checkedOutProcess.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                {
                    throw new ProcessCheckedOutByAnotherUserException(checkedOutProcess.CheckedOutBy);
                }
                else if (draftProcess == null)
                {
                    throw new ProcessDraftVersionNotFoundException(opmProcessId);
                }

                DbContext.Processes.Remove(checkedOutProcess);

                await DbContext.SaveChangesAsync();

                var process = MapEfToModel(draftProcess);
                return process;
            });
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            return await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
            {
                var process = await DbContext.Processes
                .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.CheckedOut)
                .FirstOrDefaultAsync();

                if (process == null)
                {
                    var existingDraftProcess = await GetProcessAsync(opmProcessId, ProcessVersionType.Draft, false);

                    if (existingDraftProcess == null)
                    {
                        throw new ProcessDraftVersionNotFoundException(opmProcessId);
                    }

                    process = await CloneProcessAsync(existingDraftProcess, ProcessVersionType.CheckedOut);
                }
                else if (process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                {
                    throw new ProcessCheckedOutByAnotherUserException(process.CheckedOutBy);
                }

                var model = MapEfToModel(process);
                return model;
            });
        }

        public async ValueTask<List<Process>> GetAuthorizedProcessesAsync(IAuthorizedProcessQuery processQuery)
        {
            var processes = new List<Process>();

            var sqlQuery = processQuery.GetQuery();

            if (sqlQuery != string.Empty)
            {
                var processEfs = await DbContext
                .AlternativeProcessEFView
                .FromSqlRaw(sqlQuery)
                .ToListAsync();

                processEfs.ForEach(p => processes.Add(MapEfToModel(p)));
            }

            return processes;
        }

        public async ValueTask<List<InternalProcess>> GetAuthorizedInternalProcessesAsync(IAuthorizedInternalProcessQuery processQuery)
        {
            var processes = new List<InternalProcess>();

            var sqlQuery = processQuery.GetQuery();

            if (sqlQuery != string.Empty)
            {
                var processEfs = await DbContext
                .AlternativeProcessEFWithoutDataView
                .FromSqlRaw(sqlQuery)
                .ToListAsync();

                processEfs.ForEach(p => processes.Add(MapEfToModel(p)));
            }

            return processes;
        }
        public async ValueTask<InternalProcess> GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType)
        {
            //Since there is multiple published version in dbs, and the GroupBy+SelectFirst cannot be translated and query on BD-server (ef 3.0)

            if (versionType == ProcessVersionType.Archived)
                throw new Exception("This function is not supported to get archived version");

            var internalProcess = await DbContext.Processes
               .Where(p => p.VersionType == versionType && p.OPMProcessId == opmProcessId)
               .OrderByDescending(p => p.ClusteredId)
               .Select(p => new InternalProcess
               {
                   Id = p.Id,
                   VersionType = p.VersionType,
                   CheckedOutBy = p.CheckedOutBy,
                   OPMProcessId = p.OPMProcessId,
                   ProcessWorkingStatus = p.ProcessWorkingStatus,
                   TeamAppId = p.TeamAppId
               })
               .FirstOrDefaultAsync();

            if (internalProcess == null)
            {
                if (versionType == ProcessVersionType.CheckedOut)
                {
                    throw new ProcessCheckedOutVersionNotFoundException(opmProcessId);
                }
                if (versionType == ProcessVersionType.Draft)
                {
                    throw new ProcessDraftVersionNotFoundException(opmProcessId);
                }
                if (versionType == ProcessVersionType.Published)
                {
                    throw new ProcessPublishedVersionNotFoundException(opmProcessId);
                }
            }

            return internalProcess;
        }

        public async ValueTask<InternalProcess> GetInternalProcessByProcessIdAsync(Guid processId)
        {
            var internalProcess = await DbContext.Processes
               .Where(p => p.Id == processId)
               .OrderByDescending(p => p.ClusteredId)
               .Select(p => new InternalProcess
               {
                   Id = p.Id,
                   VersionType = p.VersionType,
                   CheckedOutBy = p.CheckedOutBy,
                   OPMProcessId = p.OPMProcessId,
                   ProcessWorkingStatus = p.ProcessWorkingStatus,
                   TeamAppId = p.TeamAppId
               })
               .FirstOrDefaultAsync();

            if (internalProcess == null)
            {
                throw new ProcessNotFoundException(processId);
            }

            return internalProcess;
        }

        public async ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType)
        {
            var internalProcess = await DbContext.Processes
             .Where(p => p.VersionType == versionType && p.ProcessData.Any(pd => pd.ProcessStepId == processStepId))
             .OrderByDescending(p => p.ClusteredId)
             .Select(p => new InternalProcess
             {
                 Id = p.Id,
                 VersionType = p.VersionType,
                 CheckedOutBy = p.CheckedOutBy,
                 OPMProcessId = p.OPMProcessId,
                 ProcessWorkingStatus = p.ProcessWorkingStatus,
                 TeamAppId = p.TeamAppId
             })
             .FirstOrDefaultAsync();

            if (internalProcess == null)
            {
                throw new ProcessOfProcessStepNotFoundException(processStepId);
            }

            return internalProcess;
        }

        public async ValueTask<InternalProcess> GetInternalProcessByProcessStepIdAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            var internalProcesses = await DbContext.Processes
                .Where(p => p.ProcessData.Any(pd => pd.Hash == hash && pd.ProcessStepId == processStepId) && p.VersionType == versionType)
               .Select(p => new InternalProcess
               {
                   Id = p.Id,
                   VersionType = p.VersionType,
                   CheckedOutBy = p.CheckedOutBy,
                   OPMProcessId = p.OPMProcessId,
                   ProcessWorkingStatus = p.ProcessWorkingStatus,
                   TeamAppId = p.TeamAppId
               })
               .FirstOrDefaultAsync();


            if (internalProcesses == null)
            {
                throw new ProcessOfProcessStepNotFoundException(processStepId);
            }

            return internalProcesses;
        }

        public async ValueTask<Dictionary<Guid, ProcessData>> GetAllProcessDataAsync(Guid processId)
        {
            var processDataDict = new Dictionary<Guid, ProcessData>();

            var allProcessData = await DbContext.ProcessData
               .Where(p => p.ProcessId == processId)
               .ToListAsync();

            foreach (var item in allProcessData)
            {
                var processData = MapEfToModel(item);
                processDataDict[item.ProcessStepId] = processData;
            }

            return processDataDict;
        }

        public async ValueTask DeleteUnusedImageReferencesAsync(List<ImageReference> imageReferences, Guid opmProcessId)
        {
            if (imageReferences.Any())
            {
                //In normal case, the input data should be correctly by default
                //The following checking is just to ensure if somewhere use this method incorrectly

                //1. make sure all the process references is belong to a same process
                var processIds = imageReferences.Select(i => i.ProcessId).Distinct().ToList();
                if (processIds.Count > 1)
                {
                    throw new Exception("Delete image references of multiple process is not supported");
                }

                //2. make sure the process id & opm process id are relevant
                var processId = processIds.First();
                var isRelevant = await DbContext.Processes.AnyAsync(p => p.Id == processId && p.OPMProcessId == opmProcessId);
                if (!isRelevant)
                {
                    throw new Exception("The ProcessId and OPMProcessId are not relevant");
                }

                await InitConcurrencyLockForActionAsync(opmProcessId, async () =>
                {
                    foreach (var imageRef in imageReferences)
                    {
                        var imageRefEf = new Entities.Images.ImageReference()
                        {
                            FileName = imageRef.FileName,
                            ImageId = imageRef.ImageId,
                            ProcessId = imageRef.ProcessId
                        };
                        DbContext.ImageReferences.Attach(imageRefEf);
                        DbContext.ImageReferences.Remove(imageRefEf);
                    }
                    await DbContext.SaveChangesAsync();

                    return true;
                });
            }

        }

        private async ValueTask<Entities.Processes.Process> CloneProcessAsync(Entities.Processes.Process process, ProcessVersionType versionType)
        {
            var clonedProcess = new Entities.Processes.Process();
            clonedProcess.Id = Guid.NewGuid();
            clonedProcess.OPMProcessId = process.OPMProcessId;
            clonedProcess.EnterpriseProperties = process.EnterpriseProperties;
            clonedProcess.TeamAppId = process.TeamAppId;
            clonedProcess.VersionType = versionType;
            clonedProcess.CreatedAt = process.CreatedAt;
            clonedProcess.CreatedBy = process.CreatedBy;
            clonedProcess.ModifiedAt = process.ModifiedAt;
            clonedProcess.ModifiedBy = process.ModifiedBy;
            clonedProcess.JsonValue = process.JsonValue;

            if (versionType == ProcessVersionType.CheckedOut)
            {
                clonedProcess.CheckedOutBy = OmniaContext.Identity.LoginName;
            }


            DbContext.Processes.Add(clonedProcess);
            await DbContext.SaveChangesAsync();

            var cloneProcessDataRawSql = GenerateCloneProcessDataRawSql(clonedProcess.Id, process.Id);
            await DbContext.ExecuteSqlCommandAsync(cloneProcessDataRawSql);

            var rawSql = GenerateCloneImageReferencesRawSql(clonedProcess.Id, process.Id);
            await DbContext.ExecuteSqlCommandAsync(rawSql);

            return clonedProcess;
        }

        private async ValueTask<Entities.Processes.Process> GetProcessAsync(Guid opmProcessId, ProcessVersionType versionType, bool tracking)
        {
            var processes = tracking ? DbContext.Processes.AsTracking() : DbContext.Processes;

            var process = await processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == versionType)
                       .OrderByDescending(p => p.ClusteredId)
                       .FirstOrDefaultAsync();

            return process;
        }

        private async ValueTask<ProcessWithProcessDataIdHash> GetProcessWithProcessDataIdHashAsync(Guid opmProcessId, ProcessVersionType versionType, bool tracking)
        {
            var processes = tracking ? DbContext.Processes.AsTracking() : DbContext.Processes;

            var processWithProcessDataIdHash = await processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == versionType)
                       .OrderByDescending(p => p.ClusteredId)
                       .Select(p => new ProcessWithProcessDataIdHash
                       {
                           Process = p,
                           AllProcessDataIdHash = p.ProcessData.Select(c => new ProcessDataIdHash { Id = c.ProcessStepId, Hash = c.Hash }).ToList()
                       })
                       .FirstOrDefaultAsync();

            return processWithProcessDataIdHash;
        }

        private string GenerateCloneProcessDataRawSql(Guid newProcessId, Guid oldProcessId)
        {
            #region Names
            var tableName = nameof(DbContext.ProcessData);
            var processStepIdColumnName = nameof(Entities.Processes.ProcessData.ProcessStepId);
            var processIdColumnName = nameof(Entities.Processes.ProcessData.ProcessId);
            var referenceProcessStepIdsColumnName = nameof(Entities.Processes.ProcessData.ReferenceProcessStepIds);
            var jsonValueColumnName = nameof(Entities.Processes.ProcessData.JsonValue);
            var hashColumnName = nameof(Entities.Processes.ProcessData.Hash);
            var createdAtColumnName = nameof(Entities.Processes.ProcessData.CreatedAt);
            var modifiedAtColumnName = nameof(Entities.Processes.ProcessData.ModifiedAt);
            var createdByColumnName = nameof(Entities.Processes.ProcessData.CreatedBy);
            var modifiedByColumnName = nameof(Entities.Processes.ProcessData.ModifiedBy);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({processIdColumnName}, {processStepIdColumnName}, {hashColumnName}, {jsonValueColumnName}, {referenceProcessStepIdsColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) SELECT '{newProcessId}', pd.{processStepIdColumnName}, pd.{hashColumnName}, pd.{jsonValueColumnName}, pd.{referenceProcessStepIdsColumnName}, pd.{createdAtColumnName}, pd.{createdByColumnName}, pd.{modifiedAtColumnName}, pd.{modifiedByColumnName} FROM {tableName} pd WHERE {processIdColumnName} = '{oldProcessId}'";
            #endregion
        }

        private string GenerateCloneImageReferencesRawSql(Guid newProcessId, Guid oldProcessId)
        {
            #region Names
            var tableName = nameof(DbContext.ImageReferences);
            var processIdColumn = nameof(Entities.Images.ImageReference.ProcessId);
            var fileNameColumn = nameof(Entities.Images.ImageReference.FileName);
            var imageIdColumn = nameof(Entities.Images.ImageReference.ImageId);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({processIdColumn}, {fileNameColumn}, {imageIdColumn}) SELECT '{newProcessId}', im.{fileNameColumn}, im.{imageIdColumn} FROM {tableName} im WHERE {processIdColumn} = '{oldProcessId}'";
            #endregion
        }

        private string GenerateDeleteRelatedWorkflowRawSql(Guid opmProcessId)
        {
            #region Names
            var tableName = nameof(DbContext.Workflows);
            var editionColumnName = nameof(Entities.Workflows.Workflow.Edition);
            var opmProcessIdColumnName = nameof(Entities.Workflows.Workflow.OPMProcessId);
            #endregion

            #region SQL
            return @$"DELETE {tableName} WHERE {opmProcessIdColumnName} = '{opmProcessId}' AND {editionColumnName} = 0";
            #endregion
        }

        private string GenerateUpdateRelatedWorkflowEditionRawSql(Guid opmProcessId, int edition)
        {
            #region Names
            var tableName = nameof(DbContext.Workflows);
            var editionColumnName = nameof(Entities.Workflows.Workflow.Edition);
            var opmProcessIdColumnName = nameof(Entities.Workflows.Workflow.OPMProcessId);
            #endregion

            #region SQL
            return @$"UPDATE {tableName} SET {editionColumnName} = {edition} WHERE {opmProcessIdColumnName} = '{opmProcessId}' AND {editionColumnName} = 0";
            #endregion
        }

        private Process MapEfToModel(Entities.Processes.AlternativeProcessEF processEf)
        {
            var model = new Process();
            model.OPMProcessId = processEf.OPMProcessId;
            model.Id = processEf.Id;
            model.RootProcessStep = JsonConvert.DeserializeObject<RootProcessStep>(processEf.JsonValue);
            model.CheckedOutBy = processEf.VersionType == ProcessVersionType.CheckedOut ? processEf.CreatedBy : "";
            model.VersionType = processEf.VersionType;
            model.TeamAppId = processEf.TeamAppId;
            model.ProcessWorkingStatus = processEf.ProcessWorkingStatus;
            model.CreatedAt = processEf.CreatedAt;
            model.CreatedBy = processEf.CreatedBy;
            model.ModifiedAt = processEf.ModifiedAt;
            model.ModifiedBy = processEf.ModifiedBy;
            return model;
        }

        private InternalProcess MapEfToModel(Entities.Processes.AlternativeProcessEFWithoutData processEf)
        {
            var model = new InternalProcess();

            model.OPMProcessId = processEf.OPMProcessId;
            model.Id = processEf.Id;
            model.CheckedOutBy = processEf.CheckedOutBy;
            model.VersionType = processEf.VersionType;
            model.TeamAppId = processEf.TeamAppId;
            model.ProcessWorkingStatus = processEf.ProcessWorkingStatus;

            return model;
        }

        private ProcessData MapEfToModel(Entities.Processes.ProcessData processDataEf)
        {
            var model = JsonConvert.DeserializeObject<ProcessData>(processDataEf.JsonValue);
            model.CreatedAt = processDataEf.CreatedAt;
            model.CreatedBy = processDataEf.CreatedBy;
            model.ModifiedAt = processDataEf.ModifiedAt;
            model.ModifiedBy = processDataEf.ModifiedBy;

            return model;
        }

        private Process MapEfToModel(Entities.Processes.Process processEf)
        {
            var model = new Process();
            model.OPMProcessId = processEf.OPMProcessId;
            model.Id = processEf.Id;
            model.RootProcessStep = JsonConvert.DeserializeObject<RootProcessStep>(processEf.JsonValue);
            model.CheckedOutBy = processEf.VersionType == ProcessVersionType.CheckedOut ? processEf.CreatedBy : "";
            model.VersionType = processEf.VersionType;
            model.TeamAppId = processEf.TeamAppId;
            model.SecurityResourceId = processEf.SecurityResourceId;
            model.ProcessWorkingStatus = processEf.ProcessWorkingStatus;
            model.CreatedAt = processEf.CreatedAt;
            model.CreatedBy = processEf.CreatedBy;
            model.ModifiedAt = processEf.ModifiedAt;
            model.ModifiedBy = processEf.ModifiedBy;
            return model;
        }

        public override bool ShouldAddComputedColumn(EnterprisePropertyDefinition property)
        {
            if (property.InternalName == OPMConstants.Features.OPMDefaultProperties.Edition.InternalName ||
                property.InternalName == OPMConstants.Features.OPMDefaultProperties.Revision.InternalName)
                return true;

            return property.OmniaSearchable && (!property.BuiltIn || property.Id == Omnia.Fx.Constants.EnterpriseProperties.BuiltIn.Title.Id);
        }


        private void EnsureSystemEnterpriseProperties(Dictionary<string, JToken> enterpriseProperties, int edition, int revision)
        {
            if (!enterpriseProperties.ContainsKey(OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName) ||
                !Guid.TryParse(enterpriseProperties[OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName].ToString(), out Guid _))
            {
                throw new Exception("Invalid process type");
            }

            enterpriseProperties[OPMConstants.Features.OPMDefaultProperties.Edition.InternalName] = edition;
            enterpriseProperties[OPMConstants.Features.OPMDefaultProperties.Revision.InternalName] = revision;
        }

        private void EnsureValidProcessWorkingStatusForPublishedProcess(Guid opmProcessId, ProcessWorkingStatus oldProcessWorkingStatus, ProcessWorkingStatus newProcessWorkingStatus)
        {
            var acceptOldProcessWorkingStatus = new List<ProcessWorkingStatus>();
            switch (newProcessWorkingStatus)
            {
                case ProcessWorkingStatus.None:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SyncingToSharePoint);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.Archiving);
                    break;
                case ProcessWorkingStatus.SyncingToSharePointFailed:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SyncingToSharePoint);
                    break;
                case ProcessWorkingStatus.SyncingToSharePoint:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SyncingToSharePointFailed);
                    break;
                case ProcessWorkingStatus.ArchivingFailed:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.Archiving);
                    break;
                default:
                    throw new ProcessWorkingStatusCannotBeUpdatedException(newProcessWorkingStatus, DraftOrPublishedVersionType.Published);
            }

            if (acceptOldProcessWorkingStatus.Count > 0 && !acceptOldProcessWorkingStatus.Contains(oldProcessWorkingStatus))
            {
                throw new ProcessWorkingStatusCannotBeUpdatedException(opmProcessId, oldProcessWorkingStatus, newProcessWorkingStatus, acceptOldProcessWorkingStatus);
            }
        }

        private void EnsureNoActiveWorkflow(Entities.Processes.Process process)
        {
            if (process.ProcessWorkingStatus == ProcessWorkingStatus.SendingForReview ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.SendingForApproval ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.SentForApproval ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.SentForReview ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.CancellingApproval ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.CancellingReview ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.CancellingApprovalFailed ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.CancellingReviewFailed ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.SyncingToSharePoint ||
                process.ProcessWorkingStatus == ProcessWorkingStatus.Archiving)
            {
                throw new Exception($"There is a active worflow for this process: {process.ProcessWorkingStatus.ToString()}, try later!");
            }

            //This is another way to check active worflow but it will be slower
            //var activeWorkflow = await DbContext.Workflows.Where(w => w.OPMProcessId == opmProcessId && w.CompletedType == WorkflowCompletedType.None).AnyAsync();
            //if (activeWorkflow)
            //{
            //    throw new Exception("There is a active worflow on this process");
            //}
        }

        private void EnsureValidProcessWorkingStatusForDraftProcess(Guid opmProcessId, ProcessWorkingStatus oldProcessWorkingStatus, ProcessWorkingStatus newProcessWorkingStatus)
        {
            var acceptOldProcessWorkingStatus = new List<ProcessWorkingStatus>();
            switch (newProcessWorkingStatus)
            {
                case ProcessWorkingStatus.None:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SentForApproval);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SentForReview);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.CancellingApproval);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.CancellingReview);
                    break;
                case ProcessWorkingStatus.SendingForReview:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.None);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForReviewFailed);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForApprovalFailed);
                    break;
                case ProcessWorkingStatus.SendingForReviewFailed:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForReview);
                    break;
                case ProcessWorkingStatus.SentForReview:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForReview);
                    break;
                case ProcessWorkingStatus.CancellingReview:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SentForReview);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.CancellingReviewFailed);
                    break;
                case ProcessWorkingStatus.CancellingReviewFailed:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.CancellingReview);
                    break;
                case ProcessWorkingStatus.SendingForApproval:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.None);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForReviewFailed);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForApprovalFailed);
                    break;
                case ProcessWorkingStatus.SendingForApprovalFailed:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForApproval);
                    break;
                case ProcessWorkingStatus.SentForApproval:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SendingForApproval);
                    break;
                case ProcessWorkingStatus.CancellingApproval:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.SentForApproval);
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.CancellingApprovalFailed);
                    break;
                case ProcessWorkingStatus.CancellingApprovalFailed:
                    acceptOldProcessWorkingStatus.Add(ProcessWorkingStatus.CancellingApproval);
                    break;
                default:
                    throw new ProcessWorkingStatusCannotBeUpdatedException(newProcessWorkingStatus, DraftOrPublishedVersionType.Draft);
            }

            if (acceptOldProcessWorkingStatus.Count > 0 && !acceptOldProcessWorkingStatus.Contains(oldProcessWorkingStatus))
            {
                throw new ProcessWorkingStatusCannotBeUpdatedException(opmProcessId, oldProcessWorkingStatus, newProcessWorkingStatus, acceptOldProcessWorkingStatus);
            }
        }
    }
}
