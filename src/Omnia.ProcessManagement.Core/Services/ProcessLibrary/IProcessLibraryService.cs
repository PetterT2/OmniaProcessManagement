using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    public interface IProcessLibraryService
    {
        ValueTask<List<Process>> GetDraftProcessesDataAsync(string webUrl);
        ValueTask<(Guid, Guid, LanguageTag)> GetProcessSiteInfo(string webUrl);
    }
}
