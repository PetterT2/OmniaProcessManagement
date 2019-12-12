using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    public interface IPublishProcessService
    {
        ValueTask PublishProcessAsync(PublishProcessWithoutApprovalRequest request);
        ValueTask PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request);
    }
}
