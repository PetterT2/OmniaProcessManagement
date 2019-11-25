﻿using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    public interface IProcessService
    {
        ValueTask<Process> CreateDraftProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckInProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> SaveCheckedOutProcessAsync(ProcessActionModel actionModel);
        ValueTask<Process> CheckOutProcessAsync(Guid opmProcessId);
        ValueTask<Process> DiscardChangeProcessAsync(Guid opmProcessId);
        ValueTask<Process> PublishProcessAsync(Guid opmProcessId);
        ValueTask<ProcessDataWithAuditing> GetProcessDataAsync(Guid processStepId, ProcessVersionType vertionType, string hash);
        ValueTask<List<Process>> GetProcessesDataAsync(Guid siteId, Guid webId);
    }
}
