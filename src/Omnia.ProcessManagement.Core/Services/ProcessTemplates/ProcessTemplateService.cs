using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Core.Repositories.ProcessTemplates;
using Omnia.ProcessManagement.Models.ProcessTemplates;

namespace Omnia.ProcessManagement.Core.Services.ProcessTemplates
{
    internal class ProcessTemplateService : IProcessTemplateService
    {
        IProcessTemplateRepository ProcessTemplateRepository { get; }
        public ProcessTemplateService(IProcessTemplateRepository processTemplateRepository)
        {
            ProcessTemplateRepository = processTemplateRepository;
        }
        public async ValueTask<List<ProcessTemplate>> GetAllAsync()
        {
            return await ProcessTemplateRepository.GetAllAsync();
        }

        public async ValueTask<ProcessTemplate> AddOrUpdateAsync(ProcessTemplate processTemplate)
        {
            return await ProcessTemplateRepository.AddOrUpdateAsync(processTemplate);
        }

        public async ValueTask DeleteAsync(Guid id)
        {
            await ProcessTemplateRepository.DeleteAsync(id);
        }
    }
}
