using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.NetCore.EnterpriseProperties.ComputedColumnMappings;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Models.CanvasDefinitions;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;

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
            process.SiteId = actionModel.Process.SiteId;
            process.WebId = actionModel.Process.WebId;

            await DatabaseContext.SaveChangesAsync();

            var model = MapEfToModel(process);
            return model;
        }

        public async ValueTask DeleteDraftProcessAsync(Guid opmProcessId)
        {
            var checkedOutProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.CheckedOut, true);

            if (checkedOutProcessWithProcessDataIdHash != null && checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy.ToLower() == this.OmniaContext.Identity.LoginName)
            {
                throw new ProcessCheckedOutByAnotherUserException(checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy);
            }

            var draftProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.Draft, true);

            if (draftProcessWithProcessDataIdHash == null)
            {
                throw new ProcessDraftVersionNotFoundException(opmProcessId);
            }

            if (checkedOutProcessWithProcessDataIdHash != null)
            {
                EnsureRemovingExistingProcess(checkedOutProcessWithProcessDataIdHash);
            }
            if (draftProcessWithProcessDataIdHash != null)
            {
                EnsureRemovingExistingProcess(draftProcessWithProcessDataIdHash);
            }
            await DbContext.SaveChangesAsync();
        }

        private void AddProcessDataRecursive(Guid processId, ProcessStep processStep, Dictionary<Guid, ProcessData> processDataDict)
        {
            if (processDataDict.TryGetValue(processStep.Id, out var processData) && processData != null)
            {
                var refrerenceProcessStepIds = GetReferenceProcessStepIds(processData);

                var processDataEf = new Entities.Processes.ProcessData();
                processDataEf.ProcessStepId = processStep.Id;
                processDataEf.ProcessId = processId;
                processDataEf.JsonValue = JsonConvert.SerializeObject(processData);
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

        public async ValueTask<Process> PublishProcessAsync(Guid opmProcessId)
        {
            var checkedOutProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.CheckedOut, true);
            var draftProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.Draft, true);

            if (draftProcessWithProcessDataIdHash == null)
            {
                throw new ProcessDraftVersionNotFoundException(opmProcessId);
            }

            Entities.Processes.Process processEf = null;
            if (checkedOutProcessWithProcessDataIdHash != null)
            {
                if (checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                {
                    throw new ProcessCheckedOutByAnotherUserException(checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy);
                }
                EnsureRemovingExistingProcess(draftProcessWithProcessDataIdHash);
                processEf = checkedOutProcessWithProcessDataIdHash.Process;
            }
            else
            {
                processEf = draftProcessWithProcessDataIdHash.Process;
            }

            processEf.CheckedOutBy = "";
            processEf.VersionType = ProcessVersionType.Published;
            await DbContext.SaveChangesAsync();
            var process = MapEfToModel(processEf);
            return process;

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

            checkedOutProcessWithProcessDataIdHash.Process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep);
            checkedOutProcessWithProcessDataIdHash.Process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep.EnterpriseProperties);
            checkedOutProcessWithProcessDataIdHash.Process.ModifiedAt = DateTimeOffset.UtcNow;
            checkedOutProcessWithProcessDataIdHash.Process.ModifiedBy = OmniaContext.Identity.LoginName;

            var existingProcessDataDict = checkedOutProcessWithProcessDataIdHash.AllProcessDataIdHash.ToDictionary(p => p.Id, p => p);
            var newProcessDataDict = actionModel.ProcessData;

            var usingProcessDataIdHashSet = new HashSet<Guid>();

            UpdateProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessStep, existingProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
            RemoveOldProcessData(actionModel.Process.Id, existingProcessDataDict, usingProcessDataIdHashSet);

            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutProcessWithProcessDataIdHash.Process);
            return process;
        }

        public async ValueTask<Process> CheckInProcessAsync(ProcessActionModel actionModel)
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

            var existingDraftProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(actionModel.Process.OPMProcessId, ProcessVersionType.Draft, true);
            EnsureRemovingExistingProcess(existingDraftProcessWithProcessDataIdHash);


            checkedOutProcessWithProcessDataIdHash.Process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep);
            checkedOutProcessWithProcessDataIdHash.Process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessStep.EnterpriseProperties);
            checkedOutProcessWithProcessDataIdHash.Process.VersionType = ProcessVersionType.Draft;
            checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy = "";
            checkedOutProcessWithProcessDataIdHash.Process.ModifiedAt = DateTimeOffset.UtcNow;
            checkedOutProcessWithProcessDataIdHash.Process.ModifiedBy = OmniaContext.Identity.LoginName;

            var existingProcessWithProcessDataIdHashDict = checkedOutProcessWithProcessDataIdHash.AllProcessDataIdHash.ToDictionary(p => p.Id, p => p);
            var newProcessDataDict = actionModel.ProcessData;

            var usingProcessDataIdHashSet = new HashSet<Guid>();

            UpdateProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessStep, existingProcessWithProcessDataIdHashDict, newProcessDataDict, usingProcessDataIdHashSet);
            RemoveOldProcessData(actionModel.Process.Id, existingProcessWithProcessDataIdHashDict, usingProcessDataIdHashSet);

            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutProcessWithProcessDataIdHash.Process);
            return process;
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
                    RemoveProcessData(processId, existingProcessContent.Key);
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
                processDataEf.JsonValue = JsonConvert.SerializeObject(newProcesData);
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

        private void EnsureRemovingExistingProcess(ProcessWithProcessDataIdHash processWithProcessDataIdHash)
        {
            if (processWithProcessDataIdHash != null)
            {
                processWithProcessDataIdHash.AllProcessDataIdHash.ForEach(content => RemoveProcessData(content.Id, processWithProcessDataIdHash.Process.Id));
                DbContext.Processes.Remove(processWithProcessDataIdHash.Process);
            }
        }

        private void RemoveProcessData(Guid id, Guid processId)
        {
            var processDataEf = new Entities.Processes.ProcessData { ProcessStepId = id, ProcessId = processId };
            DbContext.ProcessData.Attach(processDataEf);
            DbContext.ProcessData.Remove(processDataEf);
        }

        public async ValueTask<ProcessDataWithAuditing> GetProcessDataAsync(Guid processStepId, string hash)
        {
            var processData = await DbContext.ProcessData
                .Where(p => p.ProcessStepId == processStepId && p.Hash == hash)
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
            var process = await DbContext.Processes
                    .Where(p => p.ProcessData.Any(p => p.ProcessStepId == processStepId) && p.VersionType == versionType)
                    .OrderByDescending(p => p.ClusteredId)
                    .FirstOrDefaultAsync();

            if (process == null)
            {
                throw new ProcessDataNotFoundException(processStepId);
            }

            //Since it has multiple published versions, we need to check on the latest published version
            if (versionType == ProcessVersionType.Published)
            {
                var latestPublishedProcessId = await DbContext.Processes
                    .Where(p => p.OPMProcessId == process.OPMProcessId)
                    .OrderByDescending(p => p.ClusteredId)
                    .Select(p => p.Id)
                    .FirstAsync();

                if (latestPublishedProcessId != process.Id)
                {
                    throw new ProcessDataNotFoundException(processStepId);
                }
            }

            var model = MapEfToModel(process);
            return model;
        }

        public async ValueTask<List<Process>> GetProcessesDataAsync(Guid siteId, Guid webId)
        {
            List<Process> processes = new List<Process>();          
            var processesData = await DbContext.Processes
               .Where(p => p.SiteId == siteId && p.WebId == webId && p.VersionType == ProcessVersionType.Draft)
               .OrderByDescending(p => p.ClusteredId)
               .ToListAsync();
            processesData.ForEach(p => processes.Add(MapEfToModel(p)));
            return processes;
        }

        public async ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            var draftProcess = await DbContext.Processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.Draft)
                       .SingleOrDefaultAsync();

            var checkedOutProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.CheckedOut, false);

            if (checkedOutProcessWithProcessDataIdHash == null)
            {
                throw new ProcessCheckedOutVersionNotFoundException(opmProcessId);
            }
            else if (checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException(checkedOutProcessWithProcessDataIdHash.Process.CheckedOutBy);
            }
            else if (draftProcess == null)
            {
                throw new ProcessDraftVersionNotFoundException(opmProcessId);
            }

            EnsureRemovingExistingProcess(checkedOutProcessWithProcessDataIdHash);
            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(draftProcess);
            return process;
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await DbContext.Processes
                .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == ProcessVersionType.CheckedOut)
                .FirstOrDefaultAsync();

            if (process == null)
            {
                process = await TryCheckOutProcessAsync(opmProcessId);
            }
            else if (process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException(process.CheckedOutBy);
            }

            var model = MapEfToModel(process);
            return model;
        }

        private async ValueTask<Entities.Processes.Process> TryCheckOutProcessAsync(Guid opmProcessId)
        {
            using (var transaction = DbContext.Database.BeginTransaction())
            {
                try
                {
                    var existingCheckedInProcessWithProcessDataIdHash = await GetProcessWithProcessDataIdHashAsync(opmProcessId, ProcessVersionType.Draft, false);

                    if (existingCheckedInProcessWithProcessDataIdHash == null)
                    {
                        throw new ProcessDraftVersionNotFoundException(opmProcessId);
                    }

                    var clonedProcess = await CloneProcessAsync(existingCheckedInProcessWithProcessDataIdHash, ProcessVersionType.CheckedOut);

                    await transaction.CommitAsync();
                    return clonedProcess;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw ex;
                }
            }
        }

        private async ValueTask<Entities.Processes.Process> CloneProcessAsync(ProcessWithProcessDataIdHash processWithProcessDataIdHash, ProcessVersionType versionType)
        {
            var checkedOutProcess = new Entities.Processes.Process();
            checkedOutProcess.Id = new Guid();
            checkedOutProcess.OPMProcessId = processWithProcessDataIdHash.Process.OPMProcessId;
            checkedOutProcess.EnterpriseProperties = processWithProcessDataIdHash.Process.EnterpriseProperties;
            checkedOutProcess.VersionType = versionType;
            checkedOutProcess.CreatedAt = processWithProcessDataIdHash.Process.CreatedAt;
            checkedOutProcess.CreatedBy = processWithProcessDataIdHash.Process.CreatedBy;
            checkedOutProcess.ModifiedAt = processWithProcessDataIdHash.Process.ModifiedAt;
            checkedOutProcess.ModifiedBy = processWithProcessDataIdHash.Process.ModifiedBy;

            if (versionType == ProcessVersionType.CheckedOut)
            {
                checkedOutProcess.CheckedOutBy = OmniaContext.Identity.LoginName;
            }

            var rootProcessStep = JsonConvert.DeserializeObject<RootProcessStep>(processWithProcessDataIdHash.Process.JsonValue);

            StringBuilder sqlStrBuilder = new StringBuilder();
            var existingProcessDataIdHastSet = processWithProcessDataIdHash.AllProcessDataIdHash.Select(c => c.Id).ToHashSet();
            UpdateProcessStepRecursive(checkedOutProcess.Id, processWithProcessDataIdHash.Process.Id, rootProcessStep, existingProcessDataIdHastSet, sqlStrBuilder);

            checkedOutProcess.JsonValue = JsonConvert.SerializeObject(rootProcessStep);

            DbContext.Processes.Add(checkedOutProcess);
            await DbContext.ExecuteSqlCommandAsync(sqlStrBuilder.ToString());

            //TODO double check number of row effected ?!
            await DbContext.SaveChangesAsync();

            return checkedOutProcess;
        }

        private void UpdateProcessStepRecursive(Guid processId, Guid oldProcessId, ProcessStep processStep,
            HashSet<Guid> existingProcessDataIdHastSet, StringBuilder sqlStrBuilder)
        {

            var processData = existingProcessDataIdHastSet.Contains(processStep.Id);
            if (processData == false)
            {
                throw new ProcessDataNotFoundException(processStep.Id);
            }

            var newProcessStepId = Guid.NewGuid();
            sqlStrBuilder.Append(GenerateCloneProcessDataRowSql(newProcessStepId, processStep.Id, processId, oldProcessId));
            processStep.Id = newProcessStepId;

            if (processStep.ProcessSteps != null)
            {
                foreach (var childProcessItem in processStep.ProcessSteps)
                {
                    UpdateProcessStepRecursive(processId, oldProcessId, childProcessItem, existingProcessDataIdHastSet, sqlStrBuilder);
                }
            }
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

        private string GenerateCloneProcessDataRowSql(Guid newId, Guid oldId, Guid newProcessId, Guid oldProcessId)
        {
            #region Names
            var tableName = nameof(DbContext.ProcessData);
            var processStepIdColumnName = nameof(Entities.Processes.ProcessData.ProcessStepId);
            var processIdColumnName = nameof(Entities.Processes.ProcessData.ProcessId);
            var jsonValueColumnName = nameof(Entities.Processes.ProcessData.JsonValue);
            var hashColumnName = nameof(Entities.Processes.ProcessData.Hash);
            var createdAtColumnName = nameof(Entities.Processes.ProcessData.CreatedAt);
            var modifiedAtColumnName = nameof(Entities.Processes.ProcessData.ModifiedAt);
            var createdByColumnName = nameof(Entities.Processes.ProcessData.CreatedBy);
            var modifiedByColumnName = nameof(Entities.Processes.ProcessData.ModifiedBy);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({processStepIdColumnName}, {processIdColumnName},{hashColumnName}, {jsonValueColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) SELECT '{newId}', '{newProcessId}',{hashColumnName}, {jsonValueColumnName},{createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName} FROM {tableName} WHERE {processStepIdColumnName} = '{oldId}' AND {processIdColumnName} = '{oldProcessId}'";
            #endregion
        }

        private ProcessDataWithAuditing MapEfToModel(Entities.Processes.ProcessData processDataEf)
        {
            var model = JsonConvert.DeserializeObject<ProcessDataWithAuditing>(processDataEf.JsonValue);
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
            return model;
        }

        private string FallbackToEmptyStringIfNull(string content)
        {
            if (content == null)
                return "";
            return content;
        }

    }
}
