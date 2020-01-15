using Omnia.Fx.Queries;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessHandler
{
    public interface IProcessHandleService
    {
        ValueTask<IOmniaQueryable<Process>> BuildProcessQueryAsync(string versionTypeStr);
    }
}
