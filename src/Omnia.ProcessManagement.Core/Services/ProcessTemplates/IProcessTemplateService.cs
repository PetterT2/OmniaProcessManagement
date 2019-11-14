using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessTemplates;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessTemplates
{
    public interface IProcessTemplateService
    {
        ValueTask<List<ProcessTemplate>> GetAllAsync();
        ValueTask<ProcessTemplate> AddOrUpdateAsync(ProcessTemplate processTemplate);
        ValueTask DeleteAsync(Guid id);
    }
}
