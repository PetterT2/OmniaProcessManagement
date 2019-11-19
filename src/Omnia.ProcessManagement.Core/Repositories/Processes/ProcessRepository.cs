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
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    internal class ProcessRepository : BaseEnterprisePropertiesEntityRepository, IProcessRepository
    {
        #region Internal Classes
        internal class InternalProcessData
        {
            public Guid Id { get; set; }
            public string Hash { get; set; }
            public string ReferenceProcessItemIds { get; set; }
        }
        internal class InternalProcess
        {
            public Entities.Processes.Process Process { get; set; }
            public List<InternalProcessData> AllInternalProcessData { get; set; }
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
            process.OPMProcessId = new Guid();
            process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessItem.EnterpriseProperties);
            process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessItem);
            process.CreatedBy = OmniaContext.Identity.LoginName;
            process.ModifiedBy = OmniaContext.Identity.LoginName;
            process.CreatedAt = DateTimeOffset.UtcNow;
            process.ModifiedAt = DateTimeOffset.UtcNow;

            var processDataDict = actionModel.ProcessData;

            AddProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessItem, processDataDict);

            DbContext.Processes.Add(process);
            await DatabaseContext.SaveChangesAsync();

            var model = MapEfToModel(process);
            return model;
        }

        private void AddProcessDataRecursive(Guid processId, InternalProcessItem processItem, Dictionary<Guid, ProcessData> processDataDict)
        {
            if (processDataDict.TryGetValue(processItem.Id, out var processData) && processData != null)
            {
                var referenceProcessItemIds = processItem.ProcessItems != null ? string.Join(',', processItem.ProcessItems.Select(p => p.Id.ToString().ToLower()).OrderBy(p => p)) : "";
                var referenceProcessItemIdsInDarwing = processData.CanvasDefinition.Shapes != null ? string.Join(',', processData.CanvasDefinition.Shapes.Select(p => p.Id.ToString().ToLower()).OrderBy(p => p)) : "";

                if (referenceProcessItemIds != referenceProcessItemIdsInDarwing)
                {
                    throw new ProcessStructureAndDrawingDataNotMatch();
                }

                var processDataEf = new Entities.Processes.ProcessData();
                processDataEf.InternalProcessItemId = processItem.Id;
                processDataEf.ProcessId = processId;
                processDataEf.JsonValue = JsonConvert.SerializeObject(processData);
                processDataEf.ReferenceProcessItemIds = referenceProcessItemIds;
                processDataEf.Hash = CommonUtils.CreateMd5Hash(processDataEf.JsonValue);
                processDataEf.CreatedBy = OmniaContext.Identity.LoginName;
                processDataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                processDataEf.CreatedAt = DateTimeOffset.UtcNow;
                processDataEf.ModifiedAt = DateTimeOffset.UtcNow;
            }
            else
            {
                throw new ProcessDataNotFoundException(processItem.Id);
            }

            if (processItem.ProcessItems != null)
            {
                foreach (var childProcessItem in processItem.ProcessItems)
                {
                    if (childProcessItem.Type == ProcessItem.ProcessItemTypes.Internal)
                    {
                        AddProcessDataRecursive(processId, childProcessItem.Cast<ProcessItem, InternalProcessItem>(), processDataDict);
                    }
                }
            }
        }

        public async ValueTask<Process> PublishProcessAsync(Guid opmProcessId)
        {
            var checkedOutInternalProcess = await GetInternalProcessAsync(opmProcessId, Entities.Processes.ProcessVersionType.CheckedOut, true);
            var draftInternalProcess = await GetInternalProcessAsync(opmProcessId, Entities.Processes.ProcessVersionType.Draft, true);

            if (draftInternalProcess == null)
            {
                throw new ProcessDraftVersionNotFoundException(opmProcessId);
            }

            Entities.Processes.Process processEf = null;
            if (checkedOutInternalProcess != null)
            {
                if (checkedOutInternalProcess.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                {
                    throw new ProcessCheckedOutByAnotherUserException();
                }
                EnsureRemovingExistingProcess(draftInternalProcess);
                processEf = checkedOutInternalProcess.Process;
            }
            else
            {
                processEf = draftInternalProcess.Process;
            }

            processEf.CheckedOutBy = "";
            processEf.VersionType = Entities.Processes.ProcessVersionType.Published;
            await DbContext.SaveChangesAsync();
            var process = MapEfToModel(processEf);
            return process;

        }

        public async ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel)
        {
            var checkedOutInternalProcess = await GetInternalProcessAsync(actionModel.Process.OPMProcessId, Entities.Processes.ProcessVersionType.CheckedOut, true);
            if (checkedOutInternalProcess == null)
            {
                throw new ProcessCheckedOutVersionNotFoundException(actionModel.Process.OPMProcessId);
            }
            else if (checkedOutInternalProcess.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException();
            }

            checkedOutInternalProcess.Process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessItem);
            checkedOutInternalProcess.Process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessItem.EnterpriseProperties);
            checkedOutInternalProcess.Process.ModifiedAt = DateTimeOffset.UtcNow;
            checkedOutInternalProcess.Process.ModifiedBy = OmniaContext.Identity.LoginName;

            var existingProcessDataDict = checkedOutInternalProcess.AllInternalProcessData.ToDictionary(p => p.Id, p => p);
            var newProcessDataDict = actionModel.ProcessData;

            var usingProcessDataIdHashSet = new HashSet<Guid>();

            UpdateProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessItem, existingProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
            RemoveOldProcessData(actionModel.Process.Id, existingProcessDataDict, usingProcessDataIdHashSet);

            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutInternalProcess.Process);
            return process;
        }

        public async ValueTask<Process> CheckInProcessAsync(ProcessActionModel actionModel)
        {
            var checkedOutInternalProcess = await GetInternalProcessAsync(actionModel.Process.OPMProcessId, Entities.Processes.ProcessVersionType.CheckedOut, true);

            if (checkedOutInternalProcess == null)
            {
                throw new ProcessCheckedOutVersionNotFoundException(actionModel.Process.OPMProcessId);
            }
            else if (checkedOutInternalProcess.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException();
            }

            var existingDraftInternalProcess = await GetInternalProcessAsync(actionModel.Process.OPMProcessId, Entities.Processes.ProcessVersionType.Draft, true);
            EnsureRemovingExistingProcess(existingDraftInternalProcess);


            checkedOutInternalProcess.Process.JsonValue = JsonConvert.SerializeObject(actionModel.Process.RootProcessItem);
            checkedOutInternalProcess.Process.EnterpriseProperties = JsonConvert.SerializeObject(actionModel.Process.RootProcessItem.EnterpriseProperties);
            checkedOutInternalProcess.Process.VersionType = Entities.Processes.ProcessVersionType.Draft;
            checkedOutInternalProcess.Process.CheckedOutBy = "";
            checkedOutInternalProcess.Process.ModifiedAt = DateTimeOffset.UtcNow;
            checkedOutInternalProcess.Process.ModifiedBy = OmniaContext.Identity.LoginName;

            var existingInternalProcessDataDict = checkedOutInternalProcess.AllInternalProcessData.ToDictionary(p => p.Id, p => p);
            var newProcessDataDict = actionModel.ProcessData;

            var usingProcessDataIdHashSet = new HashSet<Guid>();

            UpdateProcessDataRecursive(actionModel.Process.Id, actionModel.Process.RootProcessItem, existingInternalProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
            RemoveOldProcessData(actionModel.Process.Id, existingInternalProcessDataDict, usingProcessDataIdHashSet);

            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutInternalProcess.Process);
            return process;
        }

        private void RemoveOldProcessData(Guid processId, Dictionary<Guid, InternalProcessData> existingProcessDataDict, HashSet<Guid> usingProcessDataIdHashSet)
        {
            foreach (var existingProcessContent in existingProcessDataDict)
            {
                if (!usingProcessDataIdHashSet.Contains(existingProcessContent.Key))
                {
                    RemoveProcessData(processId, existingProcessContent.Key);
                }
            }
        }

        private void UpdateProcessDataRecursive(Guid processId, ProcessItem processItem,
                Dictionary<Guid, InternalProcessData> existingInternalProcessDataDict,
                Dictionary<Guid, ProcessData> newProcessDataDict,
                HashSet<Guid> usingProcessDataIdHashSet)
        {
            if (processItem.Type == ProcessItem.ProcessItemTypes.Internal)
            {
                var internalProcessItem = processItem.Cast<ProcessItem, InternalProcessItem>();

                var newProcesData = newProcessDataDict.GetValueOrDefault(internalProcessItem.Id);
                var existingProcessData = existingInternalProcessDataDict.GetValueOrDefault(internalProcessItem.Id);

                var referenceProcessItemIds = internalProcessItem.ProcessItems != null ? string.Join(',', internalProcessItem.ProcessItems.Select(p => p.Id.ToString().ToLower()).OrderBy(p => p)) : "";
                var referenceProcessItemIdsInDrawing = "";

                if (newProcesData == null)
                {
                    if (existingProcessData == null)
                    {
                        throw new ProcessDataNotFoundException(internalProcessItem.Id);
                    }
                    referenceProcessItemIdsInDrawing = existingProcessData.ReferenceProcessItemIds;
                }
                else
                {
                    if (usingProcessDataIdHashSet.Contains(internalProcessItem.Id))
                    {
                        throw new ProcessDataDuplicatedException(internalProcessItem.Id);
                    }

                    Entities.Processes.ProcessData processDataEf = null;
                    if (existingProcessData == null)
                    {
                        processDataEf = new Entities.Processes.ProcessData();
                        DbContext.ProcessData.Add(processDataEf);

                        processDataEf.InternalProcessItemId = internalProcessItem.Id;
                        processDataEf.ProcessId = processId;
                        processDataEf.CreatedAt = DateTimeOffset.UtcNow;
                        processDataEf.CreatedBy = OmniaContext.Identity.LoginName;
                    }
                    else
                    {
                        processDataEf = new Entities.Processes.ProcessData { InternalProcessItemId = internalProcessItem.Id, ProcessId = processId };
                        DbContext.ProcessData.Attach(processDataEf);
                    }

                    referenceProcessItemIdsInDrawing = newProcesData.CanvasDefinition.Shapes != null ? string.Join(',', newProcesData.CanvasDefinition.Shapes.Select(p => p.Id.ToString().ToLower()).OrderBy(p => p)) : "";

                    if (referenceProcessItemIds != referenceProcessItemIdsInDrawing)
                    {
                        throw new ProcessStructureAndDrawingDataNotMatch();
                    }

                    processDataEf.ReferenceProcessItemIds = referenceProcessItemIds;
                    processDataEf.JsonValue = JsonConvert.SerializeObject(newProcesData);
                    processDataEf.Hash = CommonUtils.CreateMd5Hash(processDataEf.JsonValue);

                    if (existingProcessData == null || existingProcessData.Hash != processDataEf.Hash)
                    {
                        processDataEf.ModifiedAt = DateTimeOffset.UtcNow;
                        processDataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                    }
                }

                usingProcessDataIdHashSet.Add(internalProcessItem.Id);

                if (internalProcessItem.ProcessItems != null)
                {
                    foreach (var childProcessItem in internalProcessItem.ProcessItems)
                    {
                        UpdateProcessDataRecursive(processId, childProcessItem, existingInternalProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
                    }
                }
            }
        }

        private void EnsureRemovingExistingProcess(InternalProcess internalProcess)
        {
            if (internalProcess != null)
            {
                internalProcess.AllInternalProcessData.ForEach(content => RemoveProcessData(content.Id, internalProcess.Process.Id));
                DbContext.Processes.Remove(internalProcess.Process);
            }
        }

        private void RemoveProcessData(Guid id, Guid processId)
        {
            var processDataEf = new Entities.Processes.ProcessData { InternalProcessItemId = id, ProcessId = processId };
            DbContext.ProcessData.Attach(processDataEf);
            DbContext.ProcessData.Remove(processDataEf);
        }

        public async ValueTask<ProcessDataWithAuditing> GetProcessDataAsync(Guid internalProcessItemId, string hash)
        {
            var processData = await DbContext.ProcessData.FirstOrDefaultAsync(p => p.InternalProcessItemId == internalProcessItemId && p.Hash == hash);
            if (processData == null)
            {
                throw new ProcessDataNotFoundException(internalProcessItemId);
            }

            var model = MapEfToModel(processData);
            return model;
        }

        public async ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            var draftProcess = await DbContext.Processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == Entities.Processes.ProcessVersionType.Draft)
                       .SingleOrDefaultAsync();

            var checkedOutInternalProcess = await GetInternalProcessAsync(opmProcessId, Entities.Processes.ProcessVersionType.CheckedOut, false);

            if (checkedOutInternalProcess == null)
            {
                throw new ProcessCheckedOutVersionNotFoundException(opmProcessId);
            }
            else if (checkedOutInternalProcess.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException();
            }
            else if (draftProcess == null)
            {
                throw new ProcessDraftVersionNotFoundException(opmProcessId);
            }

            EnsureRemovingExistingProcess(checkedOutInternalProcess);
            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(draftProcess);
            return process;
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await DbContext.Processes
                .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == Entities.Processes.ProcessVersionType.CheckedOut)
                .FirstOrDefaultAsync();

            if (process == null)
            {
                process = await TryCheckOutProcessAsync(opmProcessId);
            }
            else if (process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException();
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
                    var existingCheckedInInternalProcess = await GetInternalProcessAsync(opmProcessId, Entities.Processes.ProcessVersionType.Draft, false);

                    if (existingCheckedInInternalProcess == null)
                    {
                        throw new ProcessDraftVersionNotFoundException(opmProcessId);
                    }

                    var clonedProcess = await CloneProcessAsync(existingCheckedInInternalProcess, Entities.Processes.ProcessVersionType.CheckedOut);

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

        private async ValueTask<Entities.Processes.Process> CloneProcessAsync(InternalProcess internalProcess, Entities.Processes.ProcessVersionType versionType)
        {
            var checkedOutProcess = new Entities.Processes.Process();
            checkedOutProcess.Id = new Guid();
            checkedOutProcess.OPMProcessId = internalProcess.Process.OPMProcessId;
            checkedOutProcess.EnterpriseProperties = internalProcess.Process.EnterpriseProperties;
            checkedOutProcess.VersionType = versionType;
            checkedOutProcess.CreatedAt = internalProcess.Process.CreatedAt;
            checkedOutProcess.CreatedBy = internalProcess.Process.CreatedBy;
            checkedOutProcess.ModifiedAt = internalProcess.Process.ModifiedAt;
            checkedOutProcess.ModifiedBy = internalProcess.Process.ModifiedBy;

            if (versionType == Entities.Processes.ProcessVersionType.CheckedOut)
            {
                checkedOutProcess.CheckedOutBy = OmniaContext.Identity.LoginName;
            }

            var originalRootProcessItem = JsonConvert.DeserializeObject<RootProcessItem>(internalProcess.Process.JsonValue);

            StringBuilder sqlStrBuilder = new StringBuilder();
            var existingProcessDataIdHastSet = internalProcess.AllInternalProcessData.Select(c => c.Id).ToHashSet();
            var rootProcessItem = (RootProcessItem)GenerateProcessItemRecursive(checkedOutProcess.Id, internalProcess.Process.Id, originalRootProcessItem, existingProcessDataIdHastSet, sqlStrBuilder);

            checkedOutProcess.JsonValue = JsonConvert.SerializeObject(rootProcessItem);

            DbContext.Processes.Add(checkedOutProcess);
            await DbContext.ExecuteSqlCommandAsync(sqlStrBuilder.ToString());

            //TODO double check number of row effected ?!
            await DbContext.SaveChangesAsync();

            return checkedOutProcess;
        }

        private ProcessItem GenerateProcessItemRecursive(Guid processId, Guid oldProcessId, ProcessItem processItem,
            HashSet<Guid> existingProcessDataIdHastSet, StringBuilder sqlStrBuilder)
        {
            if (processItem.Type == ProcessItem.ProcessItemTypes.Internal)
            {
                var internalProcessItem = processItem.Cast<ProcessItem, InternalProcessItem>();

                var processData = existingProcessDataIdHastSet.Contains(internalProcessItem.Id);
                if (processData == false)
                {
                    throw new ProcessDataNotFoundException(internalProcessItem.Id);
                }

                var newInternalProcessItemId = Guid.NewGuid();
                sqlStrBuilder.Append(GenerateCloneProcessDataRowSql(newInternalProcessItemId, internalProcessItem.Id, processId, oldProcessId));
                internalProcessItem.Id = newInternalProcessItemId;

                if (internalProcessItem.ProcessItems != null)
                {
                    var processItems = new List<ProcessItem>();
                    foreach (var childProcessItem in internalProcessItem.ProcessItems)
                    {
                        processItems.Add(GenerateProcessItemRecursive(processId, oldProcessId, childProcessItem, existingProcessDataIdHastSet, sqlStrBuilder));
                    }
                    internalProcessItem.ProcessItems = processItems;
                }

                processItem = internalProcessItem;
            }

            return processItem;
        }

        private async ValueTask<InternalProcess> GetInternalProcessAsync(Guid opmProcessId, Entities.Processes.ProcessVersionType versionType, bool tracking)
        {
            var processes = tracking ? DbContext.Processes.AsTracking() : DbContext.Processes;

            var internalProcess = await processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == versionType)
                       .OrderByDescending(p => p.ClusteredId)
                       .Select(p => new InternalProcess
                       {
                           Process = p,
                           AllInternalProcessData = p.ProcessData.Select(c => new InternalProcessData { Id = c.InternalProcessItemId, Hash = c.Hash, ReferenceProcessItemIds = c.ReferenceProcessItemIds }).ToList()
                       })
                       .FirstOrDefaultAsync();

            return internalProcess;
        }

        private string GenerateCloneProcessDataRowSql(Guid newId, Guid oldId, Guid newProcessId, Guid oldProcessId)
        {
            #region Names
            var tableName = nameof(DbContext.ProcessData);
            var internalProcessItemIdColumnName = nameof(Entities.Processes.ProcessData.InternalProcessItemId);
            var processIdColumnName = nameof(Entities.Processes.ProcessData.ProcessId);
            var jsonValueColumnName = nameof(Entities.Processes.ProcessData.JsonValue);
            var hashColumnName = nameof(Entities.Processes.ProcessData.Hash);
            var createdAtColumnName = nameof(Entities.Processes.ProcessData.CreatedAt);
            var modifiedAtColumnName = nameof(Entities.Processes.ProcessData.ModifiedAt);
            var createdByColumnName = nameof(Entities.Processes.ProcessData.CreatedBy);
            var modifiedByColumnName = nameof(Entities.Processes.ProcessData.ModifiedBy);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({internalProcessItemIdColumnName}, {processIdColumnName},{hashColumnName}, {jsonValueColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) SELECT '{newId}', '{newProcessId}',{hashColumnName}, {jsonValueColumnName},{createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName} FROM {tableName} WHERE {internalProcessItemIdColumnName} = '{oldId}' AND {processIdColumnName} = '{oldProcessId}'";
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
            model.RootProcessItem = JsonConvert.DeserializeObject<RootProcessItem>(processEf.JsonValue);
            model.CheckedOutBy = processEf.VersionType == Entities.Processes.ProcessVersionType.CheckedOut ? processEf.CreatedBy : "";
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
