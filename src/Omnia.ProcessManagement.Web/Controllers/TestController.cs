using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Models.Users;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/test")]
    [ApiController]
    public class TestController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IProcessLibraryService ProcessLibraryService { get; }
        IProcessService ProcessService { get; }

        static Random random = new Random();
        public TestController(IProcessService processService, ILogger<ProcessController> logger,
            IProcessLibraryService processLibraryService)
        {
            ProcessService = processService;
            ProcessLibraryService = processLibraryService;
            Logger = logger;
        }

        
        [HttpPost, Route("createsampleprocess")]
        [Authorize]
        public async ValueTask<ApiResponse> CreateSampleProcesses(string webUrl, 
            Guid processTemplateId, Guid processTypeId, 
            int numberOfProcessToCreate, int treeLevel, int numberOfChildInEachLevel)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(webUrl))
                    throw new Exception("web url is missing");

                //Saft amount of data to create 
                if (Math.Pow(numberOfChildInEachLevel, treeLevel) * numberOfProcessToCreate > 2500) {
                    throw new Exception("this amount of data to create is toooo big. it could hang your web server =))");
                }

                var (siteId, webId, _) = await ProcessLibraryService.GetProcessSiteInfo(webUrl);

                while (numberOfProcessToCreate > 0)
                {
                    var processActionModel = new ProcessActionModel();

                    var (rootProcessStep, processDataDict) = CreateRootProcessStep(processTemplateId, processTypeId, treeLevel, numberOfChildInEachLevel);

                    processActionModel.Process = new Process()
                    {
                        Id = Guid.NewGuid(),
                        OPMProcessId = Guid.NewGuid(),
                        SiteId = siteId,
                        WebId = webId,
                        RootProcessStep = rootProcessStep
                    };

                    processActionModel.ProcessData = processDataDict;

                    await ProcessService.CreateDraftProcessAsync(processActionModel);

                    numberOfProcessToCreate--;
                }

                return ApiUtils.CreateSuccessResponse();

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        private (RootProcessStep, Dictionary<Guid, ProcessData>) CreateRootProcessStep(Guid processTemplateId, Guid processTypeId, 
            int treeLevel, int numberOfChildInEachLevel)
        {
            var title = RandomTitle();
            var processDataDict = new Dictionary<Guid, ProcessData>();
            var rootProcessStep = new RootProcessStep()
            {
                EnterpriseProperties = new Dictionary<string, Newtonsoft.Json.Linq.JToken>(),
                Id = Guid.NewGuid(),
                ProcessTemplateId = processTemplateId,
                ProcessTypeId = processTypeId,
                Title = new MultilingualString() { { LanguageTag.EnUs, title } },
                ProcessSteps = CreateProcessSteps(title, processTemplateId, processDataDict, 1, "", treeLevel, numberOfChildInEachLevel)
            };

            processDataDict[rootProcessStep.Id] = new ProcessData();

            return (rootProcessStep, processDataDict);
        }

        private List<ProcessStep> CreateProcessSteps(string title, Guid processTemplateId, Dictionary<Guid, ProcessData> processDataDict, 
            int currentLevel, string titlePostfix, int treeLevel, int numberOfChildInEachLevel)
        {
            var processSteps = new List<ProcessStep>();
            var siblingsCount = 1;

            if (currentLevel < treeLevel)
            {
                while (siblingsCount <= numberOfChildInEachLevel)
                {
                    var processStep = new ProcessStep()
                    {
                        Id = Guid.NewGuid(),
                        ProcessTemplateId = processTemplateId,
                        ProcessSteps = CreateProcessSteps(title, processTemplateId, processDataDict, 
                        currentLevel + 1, titlePostfix + "-" + siblingsCount, treeLevel, numberOfChildInEachLevel),
                        Title = new MultilingualString() { { LanguageTag.EnUs, title + titlePostfix + "-" + siblingsCount } }
                    };

                    processSteps.Add(processStep);
                    processDataDict[processStep.Id] = new ProcessData();

                    siblingsCount++;
                }
            }

            return processSteps;
        }

        private string RandomTitle()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            return new string(Enumerable.Repeat(chars, 6)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}