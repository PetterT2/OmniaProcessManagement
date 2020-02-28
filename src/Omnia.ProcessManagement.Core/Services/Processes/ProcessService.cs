using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Queries;
using Omnia.Fx.NetCore.Utils.Query;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Repositories.Transaction;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.ReviewReminders;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    internal class ProcessService : IProcessService
    {
        IProcessRepository ProcessRepository { get; }
        ITransactionRepository TransactionRepository { get; }
        public ProcessService(IProcessRepository processRepository, ITransactionRepository transactionRepository, IProcessTypeService processTypeService,
            IEnterprisePropertyService enterprisePropertyService)
        {
            ProcessRepository = processRepository;
            TransactionRepository = transactionRepository;
        }

        public async ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel)
        {
            var process = await ProcessRepository.SaveCheckedOutProcessAsync(actionModel);
            return process;
        }

        public async ValueTask<Process> CheckInProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckInProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CheckOutProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CopyToNewProcessAsync(Guid opmProcessId, Guid processStepId)
        {
            var process = await ProcessRepository.CopyToNewProcessAsync(opmProcessId, processStepId);
            return process;
        }

        public async ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.DiscardChangeProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(Guid opmProcessId)
        {
            var process = await ProcessRepository.CreateDraftProcessAsync(opmProcessId);
            return process;
        }

        public async ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel)
        {
            var process = await ProcessRepository.CreateDraftProcessAsync(actionModel);
            process = await CheckOutProcessAsync(process.OPMProcessId);
            return process;
        }

        public async ValueTask<Process> PublishProcessAsync(Guid opmProcessId, string comment, bool isRevision, Guid securityResourceId, IReviewReminderDelegateService reviewReminderDelegateService)
        {
            var process = await ProcessRepository.PublishProcessAsync(opmProcessId, comment, isRevision, securityResourceId, reviewReminderDelegateService);
            await TransactionRepository.PublishWorkingStatusChangedAsync(ProcessWorkingStatus.SyncingToSharePoint);
            return process;
        }

        public async ValueTask<List<LightProcess>> GetPublishedWithoutPermission()
        {
            return await ProcessRepository.GetPublishedWithoutPermission();
        }

        public async ValueTask UnpublishProcessAsync(Guid opmProcessId)
        {
            await ProcessRepository.UnpublishProcessAsync(opmProcessId);
            await TransactionRepository.PublishWorkingStatusChangedAsync(ProcessWorkingStatus.Archiving);
        }

        public async ValueTask<ProcessData> GetProcessDataAsync(Guid processStepId, string hash)
        {
            var processData = await ProcessRepository.GetProcessDataAsync(processStepId, hash);
            return processData;
        }

        public async ValueTask<Process> GetProcessByVersionAsync(Guid opmProcessId, int edition, int revision)
        {
            var processData = await ProcessRepository.GetProcessByVersionAsync(opmProcessId, edition, revision);
            return processData;
        }

        public async ValueTask<Process> GetProcessByIdAsync(Guid processId)
        {
            var process = await ProcessRepository.GetProcessByIdAsync(processId);
            return process;
        }

        public async ValueTask<List<Process>> GetProcessesByOPMProcessIdAsync(Guid opmProcessId, params ProcessVersionType[] versionTypes)
        {
            var processes = await ProcessRepository.GetProcessesByOPMProcessIdAsync(opmProcessId, versionTypes);
            return processes;
        }

        public async ValueTask DeleteDraftProcessAsync(Guid opmProcessId)
        {
            await ProcessRepository.DeleteDraftProcessAsync(opmProcessId);
        }

        public async ValueTask<List<Process>> GetAuthorizedProcessesAsync(IAuthorizedProcessQuery processQuery)
        {
            return await ProcessRepository.GetAuthorizedProcessesAsync(processQuery);
        }

        public async ValueTask<List<Process>> GetProcessesByWorkingStatusAsync(ProcessWorkingStatus processWorkingStatus, DraftOrPublishedVersionType vesionType)
        {
            return await ProcessRepository.GetProcessesByWorkingStatusAsync(processWorkingStatus, vesionType);
        }

        public async ValueTask<Dictionary<Guid, ProcessStatus>> GetProcessWorkingStatusAsync(IAuthorizedProcessQuery processQuery)
        {
            var internalProcessQuery = processQuery.ConvertToAuthorizedInternalProcessQuery();
            var internalProcesses = await ProcessRepository.GetAuthorizedInternalProcessesAsync(internalProcessQuery);
            List<ProcessWorkingStatus> workingStatus = new List<ProcessWorkingStatus>();

            var workingStatusDict = internalProcesses.ToDictionary(p => p.OPMProcessId, p => new ProcessStatus
            {
                ProcessWorkingStatus = p.ProcessWorkingStatus,
                CheckedOutBy = p.CheckedOutBy
            });
            return workingStatusDict;
        }

        public async ValueTask<bool> CheckIfDraftExist(Guid opmProcessId)
        {
            return await ProcessRepository.CheckIfDraftExist(opmProcessId);
        }

        public async ValueTask UpdateDraftProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, bool allowEixstingCheckedOutVersion)
        {
            await ProcessRepository.UpdateDraftProcessWorkingStatusAsync(opmProcessId, newProcessWorkingStatus, allowEixstingCheckedOutVersion);
            await TransactionRepository.PublishWorkingStatusChangedAsync(newProcessWorkingStatus);
        }

        public async ValueTask UpdatePublishedProcessWorkingStatusAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus)
        {
            await ProcessRepository.UpdatePublishedProcessWorkingStatusAsync(opmProcessId, newProcessWorkingStatus);
            await TransactionRepository.PublishWorkingStatusChangedAsync(newProcessWorkingStatus);
        }

        public async ValueTask UpdatePublishedProcessWorkingStatusAndVersionTypeAsync(Guid opmProcessId, ProcessWorkingStatus newProcessWorkingStatus, ProcessVersionType newVersionType)
        {
            await ProcessRepository.UpdatePublishedProcessWorkingStatusAndVersionTypeAsync(opmProcessId, newProcessWorkingStatus, newVersionType);
            await TransactionRepository.PublishWorkingStatusChangedAsync(newProcessWorkingStatus);
        }

        public async ValueTask UpdateNewReviewDateAsync(Guid opmProcessId, DateTime reviewDate, IReviewReminderDelegateService reviewReminderDelegateService)
        {
            await ProcessRepository.UpdateNewReviewDateAsync(opmProcessId, reviewDate, reviewReminderDelegateService);
            await TransactionRepository.PublishWorkingStatusChangedAsync(ProcessWorkingStatus.SyncingToSharePoint);
        }

        public async ValueTask<bool> CheckIfDeletingProcessStepsAreBeingUsedAsync(Guid processId, List<Guid> deletingProcessStepIds)
        {
            var beingUsed = await ProcessRepository.CheckIfDeletingProcessStepsAreBeingUsedAsync(processId, deletingProcessStepIds);
            return beingUsed;
        }

        public async ValueTask<ItemQueryResult<Process>> QueryProcesses(ItemQuery itemQuery, string securityTrimmingQuery, List<string> filterQueries)
        {
            var queryHelper = new ItemQueryHelper(itemQuery);
            return await ProcessRepository.QueryProcesses(queryHelper, securityTrimmingQuery, filterQueries);
        }

        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType versionType)
        {
            return await ProcessRepository.GetInternalProcessByOPMProcessIdAsync(opmProcessId, versionType);
        }

        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByProcessIdAsync(Guid processId)
        {
            return await ProcessRepository.GetInternalProcessByProcessIdAsync(processId);
        }

        async ValueTask<InternalProcess> IProcessService.GetInternalPublishedProcessByProcessStepIdAsync(Guid processStepId)
        {
            return await ProcessRepository.GetInternalPublishedProcessByProcessStepIdAsync(processStepId);
        }
        async ValueTask<InternalProcess> IProcessService.GetInternalProcessByProcessStepIdAsync(Guid processId, string hash)
        {
            return await ProcessRepository.GetInternalProcessByProcessStepIdAsync(processId, hash);
        }

        async ValueTask<Dictionary<Guid, ProcessData>> IProcessService.GetAllProcessDataAsync(Guid processId)
        {
            return await ProcessRepository.GetAllProcessDataAsync(processId);
        }
    }
}
