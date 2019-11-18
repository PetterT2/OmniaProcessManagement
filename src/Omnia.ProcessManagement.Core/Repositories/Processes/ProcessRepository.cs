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
        internal class IdAndHash
        {
            public Guid Id { get; set; }
            public string Hash { get; set; }
        }
        internal class ProcessReference
        {
            public Entities.Processes.Process Process { get; set; }
            public List<IdAndHash> ProcessDataIdAndHashList { get; set; }
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

        public async ValueTask<Process> CreateDraftProcessAsync(CreateDraftProcessModel createDraftProcessModel)
        {
            var process = new Entities.Processes.Process();
            process.Id = createDraftProcessModel.Process.Id;
            process.OPMProcessId = new Guid();
            process.EnterpriseProperties = JsonConvert.SerializeObject(createDraftProcessModel.Process.RootProcessItem.EnterpriseProperties);
            process.JsonValue = JsonConvert.SerializeObject(createDraftProcessModel.Process.RootProcessItem);
            process.CreatedBy = OmniaContext.Identity.LoginName;
            process.ModifiedBy = OmniaContext.Identity.LoginName;
            process.CreatedAt = DateTimeOffset.UtcNow;
            process.ModifiedAt = DateTimeOffset.UtcNow;

            var processDataDict = createDraftProcessModel.ProcessData;

            AddProcessDataRecursive(createDraftProcessModel.Process.Id, createDraftProcessModel.Process.RootProcessItem, processDataDict);

            DbContext.Processes.Add(process);
            await DatabaseContext.SaveChangesAsync();

            var model = MapEfToModel(process);
            return model;
        }

        private void AddProcessDataRecursive(Guid rootProcessId, InternalProcessItem processItem, Dictionary<Guid, ProcessData> processDataDict)
        {
            if (processDataDict.TryGetValue(processItem.ProcessDataId, out var processData) && processData != null)
            {
                var processDataEf = new Entities.Processes.ProcessData();
                processDataEf.Id = processItem.ProcessDataId;
                processDataEf.RootProcessId = rootProcessId;
                processDataEf.JsonValue = JsonConvert.SerializeObject(processData);
                processDataEf.Hash = CommonUtils.CreateMd5Hash(processDataEf.JsonValue);
                processDataEf.CreatedBy = OmniaContext.Identity.LoginName;
                processDataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                processDataEf.CreatedAt = DateTimeOffset.UtcNow;
                processDataEf.ModifiedAt = DateTimeOffset.UtcNow;
            }
            else
            {
                throw new ProcessDataNotFoundException(processItem.ProcessDataId);
            }

            if (processItem.ProcessItems != null)
            {
                foreach (var childProcessItem in processItem.ProcessItems)
                {
                    if (childProcessItem.Type == ProcessItem.ProcessItemTypes.Internal)
                    {
                        AddProcessDataRecursive(rootProcessId, childProcessItem.Cast<ProcessItem, InternalProcessItem>(), processDataDict);
                    }
                }
            }
        }

        public async ValueTask<Process> CheckInProcessAsync(CheckInProcessModel checkInProcessModel)
        {
            var checkedOutProcessReference = await GetProcessReferenceAsync(checkInProcessModel.Process.OPMProcessId, Entities.Processes.ProcessVersionType.CheckedOut, true);

            if (checkedOutProcessReference == null)
            {
                throw new ProcessCheckedOutVersionNotFoundException(checkInProcessModel.Process.OPMProcessId);
            }
            else if (checkedOutProcessReference.Process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                throw new ProcessCheckedOutByAnotherUserException();
            }

            await EnsureRemovingExistingCheckedInProcessAsync(checkInProcessModel.Process.Id, checkInProcessModel.Process.OPMProcessId);


            checkedOutProcessReference.Process.JsonValue = JsonConvert.SerializeObject(checkInProcessModel.Process.RootProcessItem);
            checkedOutProcessReference.Process.EnterpriseProperties = JsonConvert.SerializeObject(checkInProcessModel.Process.RootProcessItem.EnterpriseProperties);
            checkedOutProcessReference.Process.VersionType = Entities.Processes.ProcessVersionType.Draft;

            var existingProcessDataDict = checkedOutProcessReference.ProcessDataIdAndHashList.ToDictionary(p => p.Id, p => p);
            var newProcessDataDict = checkInProcessModel.ProcessData;

            var usingProcessDataIdHashSet = new HashSet<Guid>();

            UpdateProcessDataRecursive(checkInProcessModel.Process.Id, checkInProcessModel.Process.RootProcessItem, existingProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
            RemoveOldProcessData(existingProcessDataDict, usingProcessDataIdHashSet);

            await DbContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutProcessReference.Process);
            return process;
        }

        private void RemoveOldProcessData(Dictionary<Guid, IdAndHash> existingProcessDataDict, HashSet<Guid> usingProcessDataIdHashSet)
        {
            foreach (var existingProcessContent in existingProcessDataDict)
            {
                if (!usingProcessDataIdHashSet.Contains(existingProcessContent.Key))
                {
                    RemoveProcessData(existingProcessContent.Key);
                }
            }
        }

        private void UpdateProcessDataRecursive(Guid rootProcessId, ProcessItem processItem,
                Dictionary<Guid, IdAndHash> existingProcessDataDict,
                Dictionary<Guid, ProcessData> newProcessDataDict,
                HashSet<Guid> usingProcessDataIdHashSet)
        {
            if (processItem.Type == ProcessItem.ProcessItemTypes.Internal)
            {
                var internalProcessItem = processItem.Cast<ProcessItem, InternalProcessItem>();

                var newProcesData = newProcessDataDict.GetValueOrDefault(internalProcessItem.ProcessDataId);
                if (newProcesData == null)
                {
                    throw new ProcessDataNotFoundException(internalProcessItem.ProcessDataId);
                }
                if (usingProcessDataIdHashSet.Contains(internalProcessItem.ProcessDataId))
                {
                    throw new ProcessDataDuplicatedException(internalProcessItem.ProcessDataId);
                }

                var existingProcessData = existingProcessDataDict.GetValueOrDefault(internalProcessItem.ProcessDataId);

                Entities.Processes.ProcessData processDataEf = null;
                if (existingProcessData == null)
                {
                    processDataEf = new Entities.Processes.ProcessData();
                    DbContext.ProcessData.Add(processDataEf);

                    processDataEf.Id = internalProcessItem.ProcessDataId;
                    processDataEf.RootProcessId = rootProcessId;
                    processDataEf.CreatedAt = DateTimeOffset.UtcNow;
                    processDataEf.CreatedBy = OmniaContext.Identity.LoginName;
                }
                else
                {
                    processDataEf = new Entities.Processes.ProcessData { Id = internalProcessItem.ProcessDataId };
                    DbContext.ProcessData.Attach(processDataEf);
                }

                processDataEf.JsonValue = JsonConvert.SerializeObject(newProcesData);
                processDataEf.Hash = CommonUtils.CreateMd5Hash(processDataEf.JsonValue);

                if (existingProcessData == null || existingProcessData.Hash != processDataEf.Hash)
                {
                    processDataEf.ModifiedAt = DateTimeOffset.UtcNow;
                    processDataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                }

                usingProcessDataIdHashSet.Add(internalProcessItem.ProcessDataId);

                if (internalProcessItem.ProcessItems != null)
                {
                    foreach (var childProcessItem in internalProcessItem.ProcessItems)
                    {
                        UpdateProcessDataRecursive(rootProcessId, childProcessItem, existingProcessDataDict, newProcessDataDict, usingProcessDataIdHashSet);
                    }
                }
            }
        }

        private async ValueTask EnsureRemovingExistingCheckedInProcessAsync(Guid id, Guid opmProcessId)
        {
            var existingCheckedInProcessReference = await GetProcessReferenceAsync(opmProcessId, Entities.Processes.ProcessVersionType.Draft, true);

            if (existingCheckedInProcessReference != null)
            {
                existingCheckedInProcessReference.ProcessDataIdAndHashList.ForEach(content => RemoveProcessData(content.Id));
                DbContext.Processes.Remove(existingCheckedInProcessReference.Process);
            }
        }

        private void RemoveProcessData(Guid id)
        {
            var processDataEf = new Entities.Processes.ProcessData { Id = id };
            DbContext.ProcessData.Attach(processDataEf);
            DbContext.ProcessData.Remove(processDataEf);
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
                    var existingCheckedInProcessReference = await GetProcessReferenceAsync(opmProcessId, Entities.Processes.ProcessVersionType.Draft, false);

                    if (existingCheckedInProcessReference == null)
                    {
                        throw new ProcessDraftVersionNotFoundException(opmProcessId);
                    }

                    var clonedProcess = await CloneProcessAsync(existingCheckedInProcessReference, Entities.Processes.ProcessVersionType.CheckedOut);

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

        private async ValueTask<Entities.Processes.Process> CloneProcessAsync(ProcessReference processReference, Entities.Processes.ProcessVersionType versionType)
        {
            var checkedOutProcess = new Entities.Processes.Process();
            checkedOutProcess.Id = new Guid();
            checkedOutProcess.OPMProcessId = processReference.Process.OPMProcessId;
            checkedOutProcess.EnterpriseProperties = processReference.Process.EnterpriseProperties;
            checkedOutProcess.VersionType = versionType;
            checkedOutProcess.CreatedAt = processReference.Process.CreatedAt;
            checkedOutProcess.CreatedBy = processReference.Process.CreatedBy;
            checkedOutProcess.ModifiedAt = processReference.Process.ModifiedAt;
            checkedOutProcess.ModifiedBy = processReference.Process.ModifiedBy;

            if (versionType == Entities.Processes.ProcessVersionType.CheckedOut)
            {
                checkedOutProcess.CheckedOutBy = OmniaContext.Identity.LoginName;
            }

            var originalRootProcessItem = JsonConvert.DeserializeObject<RootProcessItem>(processReference.Process.JsonValue);

            StringBuilder sqlStrBuilder = new StringBuilder();
            var existingProcessDataIdHastSet = processReference.ProcessDataIdAndHashList.Select(c => c.Id).ToHashSet();
            var rootProcessItem = (RootProcessItem)GenerateProcessItemRecursive(checkedOutProcess.Id, originalRootProcessItem, existingProcessDataIdHastSet, sqlStrBuilder);

            checkedOutProcess.JsonValue = JsonConvert.SerializeObject(rootProcessItem);

            DbContext.Processes.Add(checkedOutProcess);
            await DbContext.ExecuteSqlCommandAsync(sqlStrBuilder.ToString());
            await DbContext.SaveChangesAsync();

            return checkedOutProcess;
        }

        private ProcessItem GenerateProcessItemRecursive(Guid rootProcessId, ProcessItem processItem,
            HashSet<Guid> existingProcessDataIdHastSet, StringBuilder sqlStrBuilder)
        {
            if (processItem.Type == ProcessItem.ProcessItemTypes.Internal)
            {
                var internalProcessItem = processItem.Cast<ProcessItem, InternalProcessItem>();

                var processData = existingProcessDataIdHastSet.Contains(internalProcessItem.ProcessDataId);
                if (processData == false)
                {
                    throw new ProcessDataNotFoundException(internalProcessItem.ProcessDataId);
                }

                var newProcessMetadataId = Guid.NewGuid();
                sqlStrBuilder.Append(GenerateCloneMetadataRowSql(newProcessMetadataId, internalProcessItem.ProcessDataId));
                internalProcessItem.ProcessDataId = newProcessMetadataId;

                if (internalProcessItem.ProcessItems != null)
                {
                    var processItems = new List<ProcessItem>();
                    foreach (var childProcessItem in internalProcessItem.ProcessItems)
                    {
                        processItems.Add(GenerateProcessItemRecursive(rootProcessId, childProcessItem, existingProcessDataIdHastSet, sqlStrBuilder));
                    }
                    internalProcessItem.ProcessItems = processItems;
                }

                processItem = internalProcessItem;
            }

            return processItem;
        }

        private async ValueTask<ProcessReference> GetProcessReferenceAsync(Guid opmProcessId, Entities.Processes.ProcessVersionType versionType, bool tracking)
        {
            var processes = tracking ? DbContext.Processes.AsTracking() : DbContext.Processes;

            var processReference = await processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == versionType)
                       .OrderByDescending(p => p.ClusteredId)
                       .Select(p => new ProcessReference
                       {
                           Process = p,
                           ProcessDataIdAndHashList = p.ProcessData.Select(c => new IdAndHash { Id = c.Id, Hash = c.Hash }).ToList()
                       })
                       .FirstOrDefaultAsync();

            return processReference;
        }

        private string GenerateCloneMetadataRowSql(Guid newId, Guid oldId)
        {
            #region Names
            var tableName = nameof(DbContext.ProcessData);
            var idColumnName = nameof(Entities.Processes.ProcessData.Id);
            var rootProcessIdColumnName = nameof(Entities.Processes.ProcessData.RootProcessId);
            var jsonValueColumnName = nameof(Entities.Processes.ProcessData.JsonValue);
            var hashColumnName = nameof(Entities.Processes.ProcessData.Hash);
            var createdAtColumnName = nameof(Entities.Processes.ProcessData.CreatedAt);
            var modifiedAtColumnName = nameof(Entities.Processes.ProcessData.ModifiedAt);
            var createdByColumnName = nameof(Entities.Processes.ProcessData.CreatedBy);
            var modifiedByColumnName = nameof(Entities.Processes.ProcessData.ModifiedBy);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({idColumnName}, {rootProcessIdColumnName},{hashColumnName}, {jsonValueColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) VALUES('{newId}', {rootProcessIdColumnName},{hashColumnName}, {jsonValueColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) SELECT {idColumnName}, {rootProcessIdColumnName}, {jsonValueColumnName},{createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName} FROM {tableName} WHERE {idColumnName} = '{oldId}' ";
            #endregion
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
