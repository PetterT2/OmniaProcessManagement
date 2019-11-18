﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Repositories.Processes
{
    internal class ProcessRepository : IProcessRepository
    {
        internal class IdAndHash
        {
            public Guid Id { get; set; }
            public string Hash { get; set; }
        }
        internal class ProcessReference
        {
            public Entities.Processes.Process Process { get; set; }
            public List<IdAndHash> MetadataIdAndHashList { get; set; }
            public List<IdAndHash> ContentIdAndHashList { get; set; }
        }

        internal class ProcessContentHash
        {
            public string Title { get; set; }
            public string Content { get; set; }
        }

        OmniaPMDbContext DatabaseContext { get; }
        IOmniaContext OmniaContext { get; }
        public ProcessRepository(OmniaPMDbContext databaseContext, IOmniaContext omniaContext)
        {
            OmniaContext = omniaContext;
            DatabaseContext = databaseContext;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(CreateDraftProcessModel createDraftProcessModel)
        {
            var process = new Entities.Processes.Process();
            process.Id = new Guid();
            process.OPMProcessId = new Guid();
            process.EnterpriseProperties = JsonConvert.SerializeObject(createDraftProcessModel.EnterpriseProperties);
            process.CreatedBy = OmniaContext.Identity.LoginName;
            process.ModifiedBy = OmniaContext.Identity.LoginName;
            process.CreatedAt = DateTimeOffset.UtcNow;
            process.ModifiedAt = DateTimeOffset.UtcNow;

            var data = new InternalProcessItem();
            data.Children = new List<ProcessItem>();
            data.MultilingualProcessContentRef = new MultilingualProcessContentRef();

            foreach (var title in createDraftProcessModel.Title)
            {
                var contentId = new Guid();
                data.MultilingualProcessContentRef[title.Key] = contentId;

                var processContent = new Entities.Processes.ProcessContent();
                processContent.Id = contentId;
                processContent.Title = FallbackToEmptyStringIfNull(processContent.Title);
                processContent.Content = "";
                processContent.CreatedBy = OmniaContext.Identity.LoginName;
                processContent.ModifiedBy = OmniaContext.Identity.LoginName;
                processContent.CreatedAt = DateTimeOffset.UtcNow;
                processContent.ModifiedAt = DateTimeOffset.UtcNow;
                processContent.RootProcessId = process.Id;
                processContent.Hash = CommonUtils.CreateMd5Hash(JsonConvert.SerializeObject(new ProcessContentHash() { Content = processContent.Content, Title = processContent.Title }));

                DatabaseContext.ProcessContents.Add(processContent);
            }

            var processMetadata = new Entities.Processes.ProcessMetadata();
            processMetadata.Id = new Guid();
            processMetadata.JsonValue = JsonConvert.SerializeObject(new ProcessMetadata());
            processMetadata.RootProcessId = process.Id;
            processMetadata.Hash = CommonUtils.CreateMd5Hash(processMetadata.JsonValue);

            DatabaseContext.ProcessMetadata.Add(processMetadata);
            data.ProcessMetadataId = processMetadata.Id;

            process.JsonValue = JsonConvert.SerializeObject(data);

            DatabaseContext.Processes.Add(process);
            await DatabaseContext.SaveChangesAsync();

            var model = MapEfToModel(process);
            return model;
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


            checkedOutProcessReference.Process.JsonValue = JsonConvert.SerializeObject(checkInProcessModel.Process.Data);
            checkedOutProcessReference.Process.EnterpriseProperties = JsonConvert.SerializeObject(checkInProcessModel.Process.EnterpriseProperties);
            checkedOutProcessReference.Process.VersionType = Entities.Processes.ProcessVersionType.Draft;

            var existingProcessContentDict = checkedOutProcessReference.ContentIdAndHashList.ToDictionary(p => p.Id, p => p);
            var existingProcessMetadataDict = checkedOutProcessReference.MetadataIdAndHashList.ToDictionary(p => p.Id, p => p);

            var newProcessContentDict = checkInProcessModel.ProcessContents;
            var newProcessMetadataDict = checkInProcessModel.ProcessMetadata;

            var usingProcessContentIdHashSet = new HashSet<Guid>();
            var usingProcessMetadataIdHashSet = new HashSet<Guid>();

            UpdateProcessContentAndProcessMetadataRecursive(checkInProcessModel.Process.Id, checkInProcessModel.Process.Data,
                existingProcessContentDict, existingProcessMetadataDict,
                newProcessContentDict, newProcessMetadataDict,
                usingProcessContentIdHashSet, usingProcessMetadataIdHashSet);

            RemoveOldProcessContentAndProcessMetadata(existingProcessContentDict, existingProcessMetadataDict,
                usingProcessContentIdHashSet, usingProcessMetadataIdHashSet);

            await DatabaseContext.SaveChangesAsync();

            var process = MapEfToModel(checkedOutProcessReference.Process);
            return process;
        }

        private void RemoveOldProcessContentAndProcessMetadata(Dictionary<Guid, IdAndHash> existingProcessContentDict, Dictionary<Guid, IdAndHash> existingProcessMetadataDict,
            HashSet<Guid> usingProcessContentIdHashSet, HashSet<Guid> usingProcessMetadataIdHashSet)
        {
            foreach (var existingProcessContent in existingProcessContentDict)
            {
                if (!usingProcessContentIdHashSet.Contains(existingProcessContent.Key))
                {
                    RemoveProcessContent(existingProcessContent.Key);
                }
            }

            foreach (var existingProcessMetadata in existingProcessMetadataDict)
            {
                if (!usingProcessMetadataIdHashSet.Contains(existingProcessMetadata.Key))
                {
                    RemoveProcessMetadata(existingProcessMetadata.Key);
                }
            }
        }

        private void RemoveProcessContent(Guid id)
        {
            var contentEf = new Entities.Processes.ProcessContent { Id = id };
            DatabaseContext.ProcessContents.Attach(contentEf);
            DatabaseContext.ProcessContents.Remove(contentEf);
        }

        private void RemoveProcessMetadata(Guid id)
        {
            var metadataEf = new Entities.Processes.ProcessMetadata { Id = id };
            DatabaseContext.ProcessMetadata.Attach(metadataEf);
            DatabaseContext.ProcessMetadata.Remove(metadataEf);
        }


        private void UpdateProcessContentAndProcessMetadataRecursive(Guid rootProcessId, ProcessItem processItem,
                Dictionary<Guid, IdAndHash> existingProcessContentDict, Dictionary<Guid, IdAndHash> existingProcessMetadataDict,
                Dictionary<Guid, ProcessContent> newProcessContentDict, Dictionary<Guid, ProcessMetadata> newProcessMetadataDict,
                HashSet<Guid> usingProcessContentIdHashSet, HashSet<Guid> usingProcessMetadataIdHashSet)
        {
            foreach (var contentRef in processItem.MultilingualProcessContentRef)
            {
                var newProcessContent = newProcessContentDict.GetValueOrDefault(contentRef.Value);
                if (newProcessContent == null)
                {
                    throw new ProcessContentNotFoundException(contentRef.Value);
                }
                if (usingProcessContentIdHashSet.Contains(contentRef.Value))
                {
                    throw new ProcessContentDuplicatedException(contentRef.Value);
                }

                var existingProcessContent = existingProcessContentDict.GetValueOrDefault(contentRef.Value);

                Entities.Processes.ProcessContent contentEf = null;
                if (existingProcessContent == null)
                {
                    contentEf = new Entities.Processes.ProcessContent();
                    DatabaseContext.ProcessContents.Add(contentEf);

                    contentEf.Id = contentRef.Value;
                    contentEf.RootProcessId = rootProcessId;
                    contentEf.CreatedAt = DateTimeOffset.UtcNow;
                    contentEf.CreatedBy = OmniaContext.Identity.LoginName;
                }
                else
                {
                    contentEf = new Entities.Processes.ProcessContent { Id = contentRef.Value };
                    DatabaseContext.ProcessContents.Attach(contentEf);
                }

                contentEf.Title = FallbackToEmptyStringIfNull(newProcessContent.Title);
                contentEf.Content = FallbackToEmptyStringIfNull(newProcessContent.Content);
                contentEf.Hash = CommonUtils.CreateMd5Hash(JsonConvert.SerializeObject(new ProcessContentHash() { Content = contentEf.Content, Title = contentEf.Title }));

                if (existingProcessContent == null || existingProcessContent.Hash != contentEf.Hash)
                {
                    contentEf.ModifiedAt = DateTimeOffset.UtcNow;
                    contentEf.ModifiedBy = OmniaContext.Identity.LoginName;
                }
            }

            if (processItem.Type == ProcessItem.ProcessItemTypes.Internal)
            {
                var internalProcessItem = processItem.Cast<ProcessItem, InternalProcessItem>();

                var newProcessMetadata = newProcessMetadataDict.GetValueOrDefault(internalProcessItem.ProcessMetadataId);
                if (newProcessMetadata == null)
                {
                    throw new ProcessMetadataNotFoundException(internalProcessItem.ProcessMetadataId);
                }
                if (usingProcessMetadataIdHashSet.Contains(internalProcessItem.ProcessMetadataId))
                {
                    throw new ProcessMetadataDuplicatedException(internalProcessItem.ProcessMetadataId);
                }

                var existingProcessMetadata = existingProcessMetadataDict.GetValueOrDefault(internalProcessItem.ProcessMetadataId);

                Entities.Processes.ProcessMetadata metadataEf = null;
                if (existingProcessMetadata == null)
                {
                    metadataEf = new Entities.Processes.ProcessMetadata();
                    DatabaseContext.ProcessMetadata.Add(metadataEf);

                    metadataEf.Id = internalProcessItem.ProcessMetadataId;
                    metadataEf.RootProcessId = rootProcessId;
                    metadataEf.CreatedAt = DateTimeOffset.UtcNow;
                    metadataEf.CreatedBy = OmniaContext.Identity.LoginName;
                }
                else
                {
                    metadataEf = new Entities.Processes.ProcessMetadata { Id = internalProcessItem.ProcessMetadataId };
                    DatabaseContext.ProcessMetadata.Attach(metadataEf);
                }

                metadataEf.JsonValue = JsonConvert.SerializeObject(newProcessMetadata);
                metadataEf.Hash = CommonUtils.CreateMd5Hash(metadataEf.JsonValue);

                if (existingProcessMetadata == null || existingProcessMetadata.Hash != metadataEf.Hash)
                {
                    metadataEf.ModifiedAt = DateTimeOffset.UtcNow;
                    metadataEf.ModifiedBy = OmniaContext.Identity.LoginName;
                }

                usingProcessMetadataIdHashSet.Add(internalProcessItem.ProcessMetadataId);

                if (internalProcessItem.Children != null)
                {
                    foreach (var child in internalProcessItem.Children)
                    {
                        UpdateProcessContentAndProcessMetadataRecursive(rootProcessId, child,
                            existingProcessContentDict, existingProcessMetadataDict,
                            newProcessContentDict, newProcessMetadataDict,
                            usingProcessContentIdHashSet, usingProcessMetadataIdHashSet);
                    }
                }
            }
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await DatabaseContext.Processes
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

        public async ValueTask<ProcessContent> GetMultilingualProcessContentAsync(Guid processContentId)
        {
            var content = await DatabaseContext.ProcessContents.Where(c => c.Id == processContentId).FirstOrDefaultAsync();
            if (content == null)
                throw new ProcessContentNotFoundException(processContentId);

            return MapEfToModel(content);

        }

        public async ValueTask<ProcessMetadata> GetProcessMetadataAsync(Guid processMetadataId)
        {
            var metadata = await DatabaseContext.ProcessMetadata.Where(c => c.Id == processMetadataId).FirstOrDefaultAsync();
            if (metadata == null)
                throw new ProcessMetadataNotFoundException(processMetadataId);

            return MapEfToModel(metadata);

        }

        public ValueTask<Process> GetLatestPublishedProcessAsync(Guid opmProcessId)
        {
            throw new NotImplementedException();
        }

        private async ValueTask<Entities.Processes.Process> TryCheckOutProcessAsync(Guid opmProcessId)
        {
            using (var transaction = DatabaseContext.Database.BeginTransaction())
            {
                try
                {
                    var existingCheckedInProcessReference = await GetProcessReferenceAsync(opmProcessId, Entities.Processes.ProcessVersionType.Draft, false);

                    if (existingCheckedInProcessReference == null)
                    {
                        throw new ProcessDraftVersionNotFoundException(opmProcessId);
                    }

                    var clonedProcess = await CloneProcessAsync(existingCheckedInProcessReference, Entities.Processes.ProcessVersionType.CheckedOut);

                    transaction.Commit();
                    return clonedProcess;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    throw ex;
                }
            }
        }

        private async ValueTask EnsureRemovingExistingCheckedInProcessAsync(Guid id, Guid opmProcessId)
        {
            var existingCheckedInProcessReference = await GetProcessReferenceAsync(opmProcessId, Entities.Processes.ProcessVersionType.Draft, true);

            if (existingCheckedInProcessReference != null)
            {
                existingCheckedInProcessReference.MetadataIdAndHashList.ForEach(metadata => RemoveProcessMetadata(metadata.Id));
                existingCheckedInProcessReference.ContentIdAndHashList.ForEach(content => RemoveProcessContent(content.Id));
                DatabaseContext.Processes.Remove(existingCheckedInProcessReference.Process);
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

            var data = JsonConvert.DeserializeObject<InternalProcessItem>(processReference.Process.JsonValue);
            DatabaseContext.Processes.Add(checkedOutProcess);

            StringBuilder sqlStrBuilder = new StringBuilder();
            var existingProcessContentIdHastSet = processReference.ContentIdAndHashList.Select(c => c.Id).ToHashSet();
            var existingProcessMetadataIdDictHashSet = processReference.MetadataIdAndHashList.Select(c => c.Id).ToHashSet();

            data = (InternalProcessItem)GenerateCloneProcessDataRecursive(checkedOutProcess.Id, data, existingProcessContentIdHastSet, existingProcessMetadataIdDictHashSet, sqlStrBuilder);

            checkedOutProcess.JsonValue = JsonConvert.SerializeObject(data);
            await DatabaseContext.ExecuteSqlCommandAsync(sqlStrBuilder.ToString());
            await DatabaseContext.SaveChangesAsync();

            return checkedOutProcess;
        }


        private ProcessItem GenerateCloneProcessDataRecursive(Guid rootProcessId, ProcessItem processItem,
            HashSet<Guid> existingProcessContentIdHastSet, HashSet<Guid> existingProcessMetadataIdDictHashSet, StringBuilder sqlStrBuilder)
        {

            foreach (var contentRef in processItem.MultilingualProcessContentRef.ToDictionary(i => i.Key, i => i.Value))
            {
                var processContent = existingProcessContentIdHastSet.Contains(contentRef.Value);
                if (processContent == false)
                {
                    throw new ProcessContentNotFoundException(contentRef.Value);
                }

                var newProcessContentId = Guid.NewGuid();
                sqlStrBuilder.Append(GenerateCloneContentRowSql(newProcessContentId, contentRef.Value));
                processItem.MultilingualProcessContentRef[contentRef.Key] = newProcessContentId;
            }

            if (processItem.Type == ProcessItem.ProcessItemTypes.Internal)
            {
                var internalProcessItem = processItem.Cast<ProcessItem, InternalProcessItem>();

                var processMetadata = existingProcessMetadataIdDictHashSet.Contains(internalProcessItem.ProcessMetadataId);
                if (processMetadata == false)
                {
                    throw new ProcessMetadataNotFoundException(internalProcessItem.ProcessMetadataId);
                }

                var newProcessMetadataId = Guid.NewGuid();
                sqlStrBuilder.Append(GenerateCloneMetadataRowSql(newProcessMetadataId, internalProcessItem.ProcessMetadataId));
                internalProcessItem.ProcessMetadataId = newProcessMetadataId;

                if (internalProcessItem.Children != null)
                {
                    var children = new List<ProcessItem>();
                    foreach (var child in internalProcessItem.Children)
                    {
                        children.Add(GenerateCloneProcessDataRecursive(rootProcessId, child,
                            existingProcessContentIdHastSet, existingProcessMetadataIdDictHashSet, sqlStrBuilder));
                    }
                    internalProcessItem.Children = children;
                }

                processItem = internalProcessItem;
            }

            return processItem;
        }

        private async ValueTask<ProcessReference> GetProcessReferenceAsync(Guid opmProcessId, Entities.Processes.ProcessVersionType versionType, bool tracking)
        {
            var processes = tracking ? DatabaseContext.Processes.AsTracking() : DatabaseContext.Processes;

            var processReference = await processes
                       .Where(p => p.OPMProcessId == opmProcessId && p.VersionType == versionType)
                       .OrderByDescending(p => p.ClusteredId)
                       .Select(p => new ProcessReference
                       {
                           Process = p,
                           ContentIdAndHashList = p.ProcessContents.Select(c => new IdAndHash { Id = c.Id, Hash = c.Hash }).ToList(),
                           MetadataIdAndHashList = p.ProcessMetadata.Select(m => new IdAndHash { Id = m.Id, Hash = m.Hash }).ToList()
                       })
                       .FirstOrDefaultAsync();

            return processReference;
        }

        private string GenerateCloneMetadataRowSql(Guid newId, Guid oldId)
        {
            #region Names
            var tableName = nameof(DatabaseContext.ProcessMetadata);
            var idColumnName = nameof(Entities.Processes.ProcessMetadata.Id);
            var rootProcessIdColumnName = nameof(Entities.Processes.ProcessMetadata.RootProcessId);
            var jsonValueColumnName = nameof(Entities.Processes.ProcessMetadata.JsonValue);
            var createdAtColumnName = nameof(Entities.Processes.ProcessMetadata.CreatedAt);
            var modifiedAtColumnName = nameof(Entities.Processes.ProcessMetadata.ModifiedAt);
            var createdByColumnName = nameof(Entities.Processes.ProcessMetadata.CreatedBy);
            var modifiedByColumnName = nameof(Entities.Processes.ProcessMetadata.ModifiedBy);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({idColumnName}, {rootProcessIdColumnName}, {jsonValueColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) VALUES('{newId}', {rootProcessIdColumnName}, {jsonValueColumnName}, {createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) SELECT {idColumnName}, {rootProcessIdColumnName}, {jsonValueColumnName},{createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName} FROM {tableName} WHERE {idColumnName} = '{oldId}' ";
            #endregion
        }

        private string GenerateCloneContentRowSql(Guid newId, Guid oldId)
        {
            #region Names
            var tableName = nameof(DatabaseContext.ProcessContents);
            var idColumnName = nameof(Entities.Processes.ProcessContent.Id);
            var rootProcessIdColumnName = nameof(Entities.Processes.ProcessContent.RootProcessId);
            var languageTagColumnName = nameof(Entities.Processes.ProcessContent.LanguageTag);
            var titleColumnName = nameof(Entities.Processes.ProcessContent.Title);
            var contentColumnName = nameof(Entities.Processes.ProcessContent.Content);
            var createdAtColumnName = nameof(Entities.Processes.ProcessMetadata.CreatedAt);
            var modifiedAtColumnName = nameof(Entities.Processes.ProcessMetadata.ModifiedAt);
            var createdByColumnName = nameof(Entities.Processes.ProcessMetadata.CreatedBy);
            var modifiedByColumnName = nameof(Entities.Processes.ProcessMetadata.ModifiedBy);
            #endregion

            #region SQL
            return @$"INSERT INTO {tableName} ({idColumnName}, {rootProcessIdColumnName}, {languageTagColumnName}, {titleColumnName}, {contentColumnName},{createdAtColumnName}, {createdByColumnName}, {modifiedAtColumnName},{modifiedByColumnName}) VALUES('{newId}',  {rootProcessIdColumnName}, {languageTagColumnName}, {titleColumnName}, {contentColumnName}) SELECT {idColumnName}, {rootProcessIdColumnName}, {languageTagColumnName}, {titleColumnName}, {contentColumnName} FROM {tableName} WHERE {idColumnName} = '{oldId}'";
            #endregion
        }

        private Process MapEfToModel(Entities.Processes.Process processEf)
        {
            var model = new Process();
            model.OPMProcessId = processEf.OPMProcessId;
            model.Id = processEf.Id;
            model.Data = JsonConvert.DeserializeObject<InternalProcessItem>(processEf.JsonValue);
            model.EnterpriseProperties = JsonConvert.DeserializeObject<Dictionary<string, JToken>>(processEf.EnterpriseProperties);
            model.CheckedOutBy = processEf.VersionType == Entities.Processes.ProcessVersionType.CheckedOut ? processEf.CreatedBy : "";
            return model;
        }

        private ProcessContent MapEfToModel(Entities.Processes.ProcessContent contentEf)
        {
            var model = new ProcessContent();
            model.Id = contentEf.Id;
            model.Title = contentEf.Title;
            model.Content = contentEf.Content;
            model.LanguageTag = contentEf.LanguageTag;

            return model;
        }

        private ProcessMetadata MapEfToModel(Entities.Processes.ProcessMetadata metadataEf)
        {
            var model = JsonConvert.DeserializeObject<ProcessMetadata>(metadataEf.JsonValue);
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
