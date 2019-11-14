using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    internal class ProcessRepository : IProcessRepository
    {
        OmniaPMDbContext DatabaseContext { get; }
        IOmniaContext OmniaContext { get; }
        public ProcessRepository(OmniaPMDbContext databaseContext, IOmniaContext omniaContext)
        {
            OmniaContext = omniaContext;
            DatabaseContext = databaseContext;
        }

        public async ValueTask<Process> CheckInProcessAsync(CheckInProcessModel model)
        {
            var checkedOutProcess = await DatabaseContext.Processes.AsTracking()
                .Include(p => p.ProcessContents)
                .Include(p => p.ProcessMetadata)
                .Where(p => p.Id == model.Process.Id && p.OPMProcessId == model.Process.OPMProcessId && p.VersionType == Entities.Processes.ProcessVersionType.CheckedOut)
                .FirstOrDefaultAsync();

            if (checkedOutProcess == null)
            {
                ThrowCheckedOutNotFoundException(model.Process.OPMProcessId);
            }
            else if (checkedOutProcess.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                ThrowCheckedOutByAnotherUserException();
            }

            await EnsureRemovingExistingCheckedInProcessAsync(model.Process.Id, model.Process.OPMProcessId);


            checkedOutProcess.Data = JsonConvert.SerializeObject(model.Process.Data);
            checkedOutProcess.EnterpriseProperties = JsonConvert.SerializeObject(model.Process.EnterpriseProperties);
            checkedOutProcess.VersionType = Entities.Processes.ProcessVersionType.CheckedIn;

            var existingProcessContentDict = checkedOutProcess.ProcessContents.ToDictionary(p => p.Id, p => p);
            var existingProcessMetadataDict = checkedOutProcess.ProcessMetadata.ToDictionary(p => p.Id, p => p);

            var newProcessContentDict = model.ProcessContents.ToDictionary(p => p.Id, p => p);
            var newProcessMetadataDict = model.ProcessMetadata.ToDictionary(p => p.Id, p => p);

            UpdateProcessContentAndProcessMetadataRecursive(model.Process.Id, model.Process.Data, existingProcessContentDict, existingProcessMetadataDict, newProcessContentDict, newProcessMetadataDict);
            await DatabaseContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutProcess);
            return process;
        }

        private (Dictionary<Guid, Entities.Processes.ProcessContent>, Dictionary<Guid, Entities.Processes.ProcessMetadata>) UpdateProcessContentAndProcessMetadataRecursive(Guid rootProcessId, InternalProcessItem processItem,
            Dictionary<Guid, Entities.Processes.ProcessContent> existingProcessConentDict, Dictionary<Guid, Entities.Processes.ProcessMetadata> existingProcessMetadataDict,
             Dictionary<Guid, ProcessContent> newProcessConentDict, Dictionary<Guid, ProcessMetadata> newProcessMetadataDict)
        {
            var usingProcessContentDict = new Dictionary<Guid, Entities.Processes.ProcessContent>();
            var usingProcessMetadataDict = new Dictionary<Guid, Entities.Processes.ProcessMetadata>();

            var newProcessMetadata = newProcessMetadataDict.GetValueOrDefault(processItem.ProcessMetadataId);
            if (newProcessMetadata == null)
            {
                ThrowMissingProcessMetadataException(processItem.ProcessMetadataId);
            }
            var existingProcessMetadata = existingProcessMetadataDict.GetValueOrDefault(processItem.ProcessMetadataId);
            if (existingProcessMetadata == null)
            {
                existingProcessMetadata = new Entities.Processes.ProcessMetadata();
                DatabaseContext.ProcessMetadata.Add(existingProcessMetadata);

                existingProcessMetadata.Id = processItem.ProcessMetadataId;
                existingProcessMetadata.RootProcessId = rootProcessId;
                existingProcessMetadata.CreatedAt = DateTimeOffset.UtcNow;
                existingProcessMetadata.CreatedBy = OmniaContext.Identity.LoginName;
            }

            var metadataJson = JsonConvert.SerializeObject(newProcessMetadata);
            if (existingProcessMetadata.JsonValue != metadataJson)
            {
                existingProcessMetadata.ModifiedAt = DateTimeOffset.UtcNow;
                existingProcessMetadata.ModifiedBy = OmniaContext.Identity.LoginName;
            }

            existingProcessMetadata.JsonValue = metadataJson;
            usingProcessMetadataDict.Add(existingProcessMetadata.Id, existingProcessMetadata);

            foreach (var contentRef in processItem.MultilingualProcessContentRef)
            {
                var newProcessContent = newProcessConentDict.GetValueOrDefault(contentRef.Value);
                if (newProcessContent == null)
                {
                    ThrowMissingProcessContentException(contentRef.Value);
                }
                var existingProcessContent = existingProcessConentDict.GetValueOrDefault(contentRef.Value);
                if (existingProcessContent == null)
                {
                    existingProcessContent = new Entities.Processes.ProcessContent();
                    DatabaseContext.ProcessContents.Add(existingProcessContent);

                    existingProcessContent.Id = contentRef.Value;
                    existingProcessContent.RootProcessId = rootProcessId;
                    existingProcessContent.CreatedAt = DateTimeOffset.UtcNow;
                    existingProcessContent.CreatedBy = OmniaContext.Identity.LoginName;
                }

                if (existingProcessContent.Title != newProcessContent.Title || existingProcessContent.Content != newProcessContent.Content)
                {
                    existingProcessMetadata.ModifiedAt = DateTimeOffset.UtcNow;
                    existingProcessMetadata.ModifiedBy = OmniaContext.Identity.LoginName;
                }

                existingProcessContent.Title = newProcessContent.Title;
                existingProcessContent.Content = newProcessContent.Content;

                usingProcessContentDict.Add(existingProcessContent.Id, existingProcessContent);
            }

            if (processItem.Children != null)
            {
                foreach (var child in processItem.Children)
                {
                    if (child.Type == ProcessItem.ProcessItemTypes.Internal)
                    {
                        var (usingProcessContentsInChild, usingProcessMetadataInChild) = UpdateProcessContentAndProcessMetadataRecursive(rootProcessId, child.Cast<ProcessItem, InternalProcessItem>(),
                            existingProcessConentDict, existingProcessMetadataDict, newProcessConentDict, newProcessMetadataDict);

                        //TODO : replace another solution 
                    }
                }
            }

            return (usingProcessContentDict, usingProcessMetadataDict);
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await DatabaseContext.Processes.Where(p => p.OPMProcessId == opmProcessId && p.VersionType == Entities.Processes.ProcessVersionType.CheckedOut).FirstOrDefaultAsync();
            if (process == null)
            {
                process = await TryCheckOutProcessAsync(opmProcessId);
            }
            else if (process.CheckedOutBy.ToLower() != OmniaContext.Identity.LoginName.ToLower())
            {
                ThrowCheckedOutByAnotherUserException();
            }

            var model = MapEfToModel(process);
            return model;
        }

        public ValueTask<ProcessContent> GetMultilingualProcessContentAsync(Guid processContentId)
        {
            throw new NotImplementedException();
        }

        public ValueTask<Process> GetProcessAsync(Guid opmProcessId)
        {
            throw new NotImplementedException();
        }

        private async ValueTask<Entities.Processes.Process> TryCheckOutProcessAsync(Guid opmProcessId)
        {
            var existingCheckedInProcessEf = DatabaseContext.Processes
                .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == Entities.Processes.ProcessVersionType.CheckedIn)
                .Include(p => p.ProcessContents)
                .Include(p => p.ProcessMetadata)
                .FirstOrDefault();

            if (existingCheckedInProcessEf == null)
            {
                ThrowDraftNotFoundException(opmProcessId);
            }

            var clonedProcess = await CloneProcessAsync(existingCheckedInProcessEf, Entities.Processes.ProcessVersionType.CheckedOut);
            return clonedProcess;
        }

        private async ValueTask EnsureRemovingExistingCheckedInProcessAsync(Guid id, Guid opmProcessId)
        {
            var checkedInProcess = await DatabaseContext.Processes.AsTracking()
               .Include(p => p.ProcessContents)
               .Include(p => p.ProcessMetadata)
               .Where(p => p.Id == id && p.OPMProcessId == opmProcessId && p.VersionType == Entities.Processes.ProcessVersionType.CheckedIn)
               .FirstOrDefaultAsync();

            if (checkedInProcess != null)
            {
                DatabaseContext.ProcessContents.RemoveRange(checkedInProcess.ProcessContents);
                DatabaseContext.ProcessMetadata.RemoveRange(checkedInProcess.ProcessMetadata);
                DatabaseContext.Processes.Remove(checkedInProcess);
            }
        }

        private async ValueTask<Entities.Processes.Process> CloneProcessAsync(Entities.Processes.Process process, Entities.Processes.ProcessVersionType versionType)
        {
            var checkedOutProcess = new Entities.Processes.Process();
            checkedOutProcess.Id = new Guid();
            checkedOutProcess.OPMProcessId = process.OPMProcessId;
            checkedOutProcess.EnterpriseProperties = process.EnterpriseProperties;
            checkedOutProcess.VersionType = versionType;
            checkedOutProcess.CreatedAt = process.CreatedAt;
            checkedOutProcess.CreatedBy = process.CreatedBy;
            checkedOutProcess.ModifiedAt = process.ModifiedAt;
            checkedOutProcess.ModifiedBy = process.ModifiedBy;

            if (versionType == Entities.Processes.ProcessVersionType.CheckedOut)
            {
                checkedOutProcess.CheckedOutBy = OmniaContext.Identity.LoginName;
            }

            var data = JsonConvert.DeserializeObject<InternalProcessItem>(process.Data);
            DatabaseContext.Processes.Add(checkedOutProcess);

            GenerateCloneProcessDataRecursive(checkedOutProcess.Id, data, process.ProcessContents.ToDictionary(p => p.Id, p => p), process.ProcessMetadata.ToDictionary(p => p.Id, p => p));

            checkedOutProcess.Data = JsonConvert.SerializeObject(data);
            await DatabaseContext.SaveChangesAsync();

            return checkedOutProcess;
        }


        private void GenerateCloneProcessDataRecursive(Guid rootProcessId, InternalProcessItem internalProcessItem, Dictionary<Guid, Entities.Processes.ProcessContent> existingProcessContentDict, Dictionary<Guid, Entities.Processes.ProcessMetadata> existingProcessMetadataDict)
        {
            var processMetadata = existingProcessMetadataDict.GetValueOrDefault(internalProcessItem.ProcessMetadataId);
            if (processMetadata == null)
            {
                ThrowMissingProcessMetadataException(internalProcessItem.ProcessMetadataId);
            }

            var newProcessMetadataId = Guid.NewGuid();
            internalProcessItem.ProcessMetadataId = newProcessMetadataId;

            Entities.Processes.ProcessMetadata newProcessMetadata = new Entities.Processes.ProcessMetadata();
            newProcessMetadata.Id = newProcessMetadataId;
            newProcessMetadata.JsonValue = processMetadata.JsonValue;
            newProcessMetadata.RootProcessId = rootProcessId;
            newProcessMetadata.JsonValue = processMetadata.JsonValue;
            newProcessMetadata.CreatedAt = processMetadata.CreatedAt;
            newProcessMetadata.CreatedBy = processMetadata.CreatedBy;
            newProcessMetadata.ModifiedAt = processMetadata.ModifiedAt;
            newProcessMetadata.ModifiedBy = processMetadata.ModifiedBy;

            DatabaseContext.ProcessMetadata.Add(newProcessMetadata);

            foreach (var contentRef in internalProcessItem.MultilingualProcessContentRef.ToDictionary(i => i.Key, i => i.Value))
            {
                var processContent = existingProcessContentDict.GetValueOrDefault(contentRef.Value);
                if (processContent == null)
                {
                    ThrowMissingProcessContentException(contentRef.Value);
                }

                var newProcessContentId = Guid.NewGuid();
                internalProcessItem.ProcessMetadataId = newProcessContentId;

                Entities.Processes.ProcessContent newProcessContent = new Entities.Processes.ProcessContent();
                newProcessContent.Id = newProcessContentId;
                newProcessContent.LanguageTag = processContent.LanguageTag;
                newProcessContent.Title = processContent.Title;
                newProcessContent.Content = processContent.Content;
                newProcessContent.RootProcessId = rootProcessId;
                newProcessContent.CreatedAt = newProcessContent.CreatedAt;
                newProcessContent.CreatedBy = newProcessContent.CreatedBy;
                newProcessContent.ModifiedAt = newProcessContent.ModifiedAt;
                newProcessContent.ModifiedBy = newProcessContent.ModifiedBy;

                DatabaseContext.ProcessContents.Add(newProcessContent);
            }

            if (internalProcessItem.Children != null)
            {
                foreach (var child in internalProcessItem.Children)
                {
                    if (child.Type == ProcessItem.ProcessItemTypes.Internal)
                    {
                        GenerateCloneProcessDataRecursive(rootProcessId, child.Cast<ProcessItem, InternalProcessItem>(), existingProcessContentDict, existingProcessMetadataDict);
                    }
                }
            }
        }

        private Process MapEfToModel(Entities.Processes.Process efProcess)
        {
            var model = new Process();
            model.OPMProcessId = efProcess.OPMProcessId;
            model.Id = efProcess.Id;
            model.Data = JsonConvert.DeserializeObject<InternalProcessItem>(efProcess.Data);
            model.EnterpriseProperties = JsonConvert.DeserializeObject<Dictionary<string, JToken>>(efProcess.EnterpriseProperties);
            model.CheckedOutBy = efProcess.VersionType == Entities.Processes.ProcessVersionType.CheckedOut ? efProcess.CreatedBy : "";
            return model;
        }

        private void ThrowMissingProcessContentException(Guid id)
        {
            throw new Exception($"Process content with id: {id} not found"); //TODO
        }

        private void ThrowMissingProcessMetadataException(Guid id)
        {
            throw new Exception($"Process metadata with id: {id} not found"); //TODO
        }

        private void ThrowDuplicatedProcessContentException(Guid id)
        {
            throw new Exception($"Process content with id: {id} is duplicated"); //TODO
        }

        private void ThrowDuplicatedProcessMetadataException(Guid id)
        {
            throw new Exception($"Process metadata with id: {id} is duplicated"); //TODO
        }

        private void ThrowCheckedOutByAnotherUserException()
        {
            throw new Exception("Checked out by another user"); //TODO
        }

        private void ThrowDraftNotFoundException(Guid opmProcessId)
        {
            throw new Exception($"The process with id :{opmProcessId} doesn't have draft version"); //TODO
        }

        private void ThrowCheckedOutNotFoundException(Guid opmProcessId)
        {
            throw new Exception($"The process with id :{opmProcessId} is checked out!"); //TODO
        }
    }
}
