using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    internal class ProcessService : IProcessService
    {
        public ProcessService()
        {

        }

        public ValueTask<Process> CheckInProcess(CheckInProcessModel model)
        {
            throw new NotImplementedException();
        }

        public ValueTask<Process> CheckOutProcess(Guid processId)
        {
            throw new NotImplementedException();
        }

        public ValueTask<ProcessContent> GetMultilingualProcessContent(Guid processContentId)
        {
            throw new NotImplementedException();
        }

        public ValueTask<Process> GetProcess(Guid processId)
        {
            throw new NotImplementedException();
        }
    }
}
