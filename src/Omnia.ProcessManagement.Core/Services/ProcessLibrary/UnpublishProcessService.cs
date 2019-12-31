using Microsoft.SharePoint.Client;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.ProcessManagement.Core.Repositories.Transaction;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessTypes;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class UnpublishProcessService : IUnpublishProcessService
    {
        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        IProcessService ProcessService { get; }
        ITransactionRepository TransactionRepository { get; }
        IProcessTypeService ProcessTypeService { get; }
        ISettingsService SettingsService { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        ISharePointListService SharePointListService { get; }

        public UnpublishProcessService(ITransactionRepository transactionRepositiory, 
            IProcessService processService,
            ITeamCollaborationAppsService teamCollaborationAppsService,
            IProcessTypeService processTypeService,
            ISettingsService settingsService,
            ISharePointClientContextProvider sharePointClientContextProvider,
            ISharePointListService sharePointListService)
        {
            ProcessService = processService;
            TransactionRepository = transactionRepositiory;
            TeamCollaborationAppsService = teamCollaborationAppsService;
            ProcessTypeService = processTypeService;
            SettingsService = settingsService;
            SharePointClientContextProvider = sharePointClientContextProvider;
            SharePointListService = sharePointListService;
        }

        public async ValueTask UnpublishProcessAsync(Guid opmProcessId)
        {
            await ProcessService.UnpublishProcessAsync(opmProcessId);
        }

        public async ValueTask ProcessUnpublishingAsync(Process process)
        {
            await TransactionRepository.InitTransactionAsync(async () =>
            {
                await ProcessService.UpdateLatestPublishedProcessWorkingStatusAndVersionTypeAsync(process.OPMProcessId, ProcessWorkingStatus.None, ProcessVersionType.Archived);
                var spUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);
                await ProcessUnpublishingAsync(spUrl, process);
            });
        }

        private async ValueTask ProcessUnpublishingAsync(string webUrl, Process process)
        {
            if (Guid.TryParse(process.RootProcessStep.EnterpriseProperties[OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName].ToString(), out Guid processTypeId))
            {
                var processCtx = SharePointClientContextProvider.CreateClientContext(webUrl, true);
                processCtx.Load(processCtx.Web);
                processCtx.Load(processCtx.Web, w => w.Language);
                var publishedList = await SharePointListService.GetListByUrlAsync(processCtx, OPMConstants.SharePoint.ListUrl.PublishList, true);
                var opmProcessIdFolder = await SharePointListService.GetChildFolderAsync(processCtx, publishedList.RootFolder, process.OPMProcessId.ToString("N"), true);

                var processTypes = await ProcessTypeService.GetByIdsAsync(processTypeId);
                ProcessType processType = processTypes.FirstOrDefault();
                var archiveSetting = processType.Settings.Cast<ProcessTypeSettings, ProcessTypeItemSettings>().Archive;
                GlobalSettings globalSettings = await SettingsService.GetAsync<GlobalSettings>();
                if(archiveSetting != null && (!string.IsNullOrEmpty(globalSettings.ArchiveSiteUrl) || !string.IsNullOrEmpty(archiveSetting.Url)))
                {
                    string archiveSiteUrl = !string.IsNullOrEmpty(archiveSetting.Url) ? archiveSetting.Url : globalSettings.ArchiveSiteUrl;
                    var archiveCtx = SharePointClientContextProvider.CreateClientContext(archiveSiteUrl, true);
                    var archivedList = await SharePointListService.GetListByUrlAsync(archiveCtx, OPMConstants.SharePoint.ListUrl.ArchivedList, true);
                    var archivedProcessIdFolder = await SharePointListService.EnsureChildFolderAsync(archiveCtx, archivedList.RootFolder, process.OPMProcessId.ToString("N"));
                    var imageFolder = await SharePointListService.GetChildFolderAsync(processCtx, opmProcessIdFolder, OPMConstants.SharePoint.FolderUrl.Images, true);
                    await CopyContentToArchive(processCtx, archiveCtx, opmProcessIdFolder, imageFolder, archivedProcessIdFolder);
                }
                await SharePointListService.DeleteFolder(processCtx, opmProcessIdFolder);
            }
        }

        private async ValueTask CopyContentToArchive(PortableClientContext sourceCtx, PortableClientContext archiveCtx, Folder opmProcessIdFolder, Folder imageFolder, 
            Folder archivedProcessIdFolder)
        {
            Folder archivedLatestPublishedProcessFolder = await SharePointListService.EnsureChildFolderAsync(archiveCtx, archivedProcessIdFolder, opmProcessIdFolder.Name);
            foreach(Microsoft.SharePoint.Client.File file in opmProcessIdFolder.Files)
            {
                ClientResult<Stream> fileStream = file.OpenBinaryStream();
                sourceCtx.Load(file);
                await sourceCtx.ExecuteQueryAsync();
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    OPMUtilities.CopyStream(fileStream, memoryStream);
                    string fileName = Path.GetFileName(file.ServerRelativeUrl);
                    await SharePointListService.UploadDocumentAsync(archiveCtx.Web, archivedLatestPublishedProcessFolder, fileName, memoryStream);
                }
            }

            if(imageFolder != null && imageFolder.Files.Count > 0)
            {
                Folder archivedImageFolder = await SharePointListService.EnsureChildFolderAsync(archiveCtx, archivedProcessIdFolder, OPMConstants.SharePoint.FolderUrl.Images);
                foreach (Microsoft.SharePoint.Client.File imageFile in imageFolder.Files)
                {
                    ClientResult<Stream> fileStream = imageFile.OpenBinaryStream();
                    sourceCtx.Load(imageFile);
                    await sourceCtx.ExecuteQueryAsync();
                    using (MemoryStream memoryStream = new MemoryStream())
                    {
                        OPMUtilities.CopyStream(fileStream, memoryStream);
                        string fileName = Path.GetFileName(imageFile.ServerRelativeUrl);
                        await SharePointListService.UploadDocumentAsync(archiveCtx.Web, archivedImageFolder, fileName, memoryStream);
                    }
                }
            }
        }
    }
}
