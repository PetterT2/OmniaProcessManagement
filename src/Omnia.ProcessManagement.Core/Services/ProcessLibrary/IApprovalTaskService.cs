using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    public interface IApprovalTaskService
    {
        ValueTask AddApprovalTaskAndSendEmailAsync(PublishProcessWithApprovalRequest request, Process process);
    }
}
