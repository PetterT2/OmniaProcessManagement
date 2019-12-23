using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.SharePoint.Client;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Localization;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Fields.Attributes;
using Omnia.Fx.SharePoint.Services.SharePointEntities;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Repositories.Transaction;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Settings;

namespace Omnia.ProcessManagement.Core.Services.Processes
{
    internal class ProcessSyncingService : IProcessSyncingService
    {
        private static HashSet<string> ProvisionedInternalNames = new HashSet<string>();

        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        IProcessService ProcessService { get; }
        ITransactionRepository TransactionRepository { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }

        ISharePointGroupService SharePointGroupService { get; }
        ISharePointListService SharePointListService { get; }
        IEnterprisePropertyService EnterprisePropertyService { get; }
        ISharePointEntityProvider SharePointEntityProvider { get; }
        ILocalizationProvider LocalizationProvider { get; }
        IMultilingualHelper MultilingualHelper { get; }
        ISharePointPermissionService SharePointPermissionService { get; }
        ISettingsService SettingsService { get; }
        IProcessSecurityService ProcessSecurityService { get; }

        public ProcessSyncingService(IProcessService processService, ITransactionRepository transactionRepository,
            ITeamCollaborationAppsService teamCollaborationAppsService, ISharePointClientContextProvider sharePointClientContextProvider,
            ISharePointListService sharePointListService, IEnterprisePropertyService enterprisePropertyService,
            ISharePointEntityProvider sharePointEntityProvider, ILocalizationProvider localizationProvider,
            IMultilingualHelper multilingualHelper, ISharePointPermissionService sharePointPermissionService,
            IProcessSecurityService processSecurityService, ISettingsService settingsService,
            ISharePointGroupService sharePointGroupService)
        {
            ProcessService = processService;
            TransactionRepository = transactionRepository;
            TeamCollaborationAppsService = teamCollaborationAppsService;
            SharePointClientContextProvider = sharePointClientContextProvider;
            SharePointListService = sharePointListService;
            EnterprisePropertyService = enterprisePropertyService;
            SharePointEntityProvider = sharePointEntityProvider;
            LocalizationProvider = localizationProvider;
            MultilingualHelper = multilingualHelper;
            SharePointPermissionService = sharePointPermissionService;
            ProcessSecurityService = processSecurityService;
            SettingsService = settingsService;
            SharePointGroupService = sharePointGroupService;
        }

        public async ValueTask SyncToSharePointAsync(Process process)
        {
            await TransactionRepository.InitTransactionAsync(async () =>
            {
                await ProcessService.UpdateLatestPublishedProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.None);
                var spUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);

                await SyncToSharePointAsync(spUrl, process);
            });
        }

        private async ValueTask SyncToSharePointAsync(string spUrl, Process process)
        {
            var ctx = SharePointClientContextProvider.CreateClientContext(spUrl, true);

            List<Microsoft.SharePoint.Client.User> limitedReadAccessUser = null;
            Microsoft.SharePoint.Client.Group authorGroup = null;

            if (process.SecurityResourceId == process.OPMProcessId.ToString())
            {
                limitedReadAccessUser = await ProcessSecurityService.EnsureProcessLimitedReadAccessSharePointUsersAsync(ctx, process.OPMProcessId);
            }
            else {
                var siteGroupIdSettings = await SettingsService.GetAsync<SiteGroupIdSettings>(process.TeamAppId.ToString());

                if (siteGroupIdSettings == null)
                    throw new Exception("Missing Process Author SharePoint group");

                authorGroup = await SharePointGroupService.TryGetGroupByIdAsync(ctx, ctx.Site.RootWeb, siteGroupIdSettings.AuthorGroupId);
                if (authorGroup == null)
                    throw new Exception($"Cannot get Process Author SharePoint group with id: {siteGroupIdSettings.AuthorGroupId}");
            }

            var publishedList = await SharePointListService.GetListByUrlAsync(ctx, OPMConstants.SharePoint.ListUrl.PublishList, true);

            var internalNames = process.RootProcessStep.EnterpriseProperties.Keys.ToList();

            var ensuredSharePointNewFields = await EnsureSharePointFieldsAsync(ctx, internalNames, publishedList, OPMConstants.SharePoint.ListUrl.PublishList);
            if (ensuredSharePointNewFields)
            {
                ctx = SharePointClientContextProvider.CreateClientContext(spUrl, true);
                publishedList = await SharePointListService.GetListByUrlAsync(ctx, OPMConstants.SharePoint.ListUrl.PublishList, true);
            }

            var folderUrl = process.OPMProcessId.ToString();
            var folder = await SharePointListService.EnsureChildFolderAsync(ctx, publishedList.RootFolder, folderUrl, true);

            if (limitedReadAccessUser != null)
            {
                Dictionary<Principal, List<RoleType>> roleAssignments = new Dictionary<Principal, List<RoleType>>();
                limitedReadAccessUser.ForEach(user => roleAssignments.Add(user, new List<RoleType> { RoleType.Reader }));
                roleAssignments.Add(authorGroup, new List<RoleType> { RoleType.Reader });

                await SharePointPermissionService.BreakListItemPermissionAsync(ctx, folder.ListItemAllFields, false, false, roleAssignments);
            }
        }

        private async ValueTask<bool> EnsureSharePointFieldsAsync(PortableClientContext appContext, List<string> internalNames, Microsoft.SharePoint.Client.List listWithFields, string listRelativeUrl)
        {
            var ensuredNewFields = false;
            var (enterpriseProperties, cache) = await EnterprisePropertyService.GetAllAsync();
            var enterprisePropertiesNeedToEnsure = new List<EnterprisePropertyDefinition>();

            appContext.Load(appContext.Web);
            appContext.Load(appContext.Web, w => w.Language);
            appContext.Load(appContext.Web.AvailableFields, f => f.IncludeWithDefaultProperties(t => t.Scope));
            await appContext.ExecuteQueryAsync();

            foreach (var internalName in internalNames)
            {
                var existedField = listWithFields.Fields.FirstOrDefault(f => f.InternalName == internalName);
                if (existedField == null)
                {
                    var enterpriseProperty = enterpriseProperties.FirstOrDefault(p => p.InternalName == internalName);
                    if (enterpriseProperty == null)
                    {
                        throw new Exception("Invalid SharePoint field: cannot find related EnterpriseProperty to ensure to SharePoint library");
                    }

                    if (!ProvisionedInternalNames.Contains(enterpriseProperty.InternalName))
                    {
                        enterprisePropertiesNeedToEnsure.Add(enterpriseProperty);
                    }
                }
            }

            if (ensuredNewFields)
                await appContext.ExecuteQueryAsync();

            if (enterprisePropertiesNeedToEnsure.Count > 0)
            {
                ensuredNewFields = true;
                await appContext.LoadIfNeeded(appContext.Web, w => w.Language).ExecuteQueryIfNeededAsync();

                var context = SharePointEntityProvider.CreateContext(appContext.Site, appContext.Web);
                var language = CultureUtils.GetCultureInfo((int)appContext.Web.Language);
                string fieldGroupName = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.FieldGroupName, appContext.Web.Language);

                foreach (var enterpriseProperty in enterprisePropertiesNeedToEnsure)
                {
                    var propertyTitle = await MultilingualHelper.GetValue(enterpriseProperty.Title, language.Name, Guid.Empty);
                    if (string.IsNullOrEmpty(propertyTitle))
                        propertyTitle = enterpriseProperty.InternalName;

                    var fieldAttribute = MapContentPropertyToFieldAttribute(enterpriseProperty, propertyTitle, fieldGroupName);

                    context
                        .EnsureField(fieldAttribute)
                        .AddToList($"/{listRelativeUrl}");

                }
                await context.ExecuteAsync();

                enterprisePropertiesNeedToEnsure.ForEach(property => ProvisionedInternalNames.Add(property.InternalName));
            }

            return ensuredNewFields;
        }

        private FieldAttribute MapContentPropertyToFieldAttribute(EnterprisePropertyDefinition enterpriseProperty, string title, string group)
        {
            var fieldAttribute = CreateFieldAttribute(enterpriseProperty);

            fieldAttribute.Title = title;
            fieldAttribute.Required = false;
            fieldAttribute.Group = group;
            fieldAttribute.Description = group;
            fieldAttribute.ReadOnlyField = false;

            return fieldAttribute;
        }

        private FieldAttribute CreateFieldAttribute(EnterprisePropertyDefinition enterpriseProperty)
        {
            string fieldId = enterpriseProperty.Id.ToString();
            string fieldInternalName = enterpriseProperty.InternalName;

            switch (enterpriseProperty.EnterprisePropertyDataType.IndexedType)
            {
                case PropertyIndexedType.Number:
                    return new NumberFieldAttribute(fieldId, fieldInternalName);
                case PropertyIndexedType.Boolean:
                    return new BooleanFieldAttribute(fieldId, fieldInternalName);
                case PropertyIndexedType.DateTime:
                    return new DateTimeFieldAttribute(fieldId, fieldInternalName);
                case PropertyIndexedType.Person:
                    return new UserFieldAttribute(fieldId, fieldInternalName, true);
                case PropertyIndexedType.RichText:
                    return new NoteFieldAttribute(fieldId, fieldInternalName) { RichText = true };
                case PropertyIndexedType.Taxonomy:
                    var taxonomy = enterpriseProperty.Settings.CastTo<TaxonomyPropertySettings>();
                    return new ManagedMetadataFieldAttribute(fieldId, fieldInternalName, true, termSetIdOrName: taxonomy.TermSetId.ToString());
                case PropertyIndexedType.Text:
                    return new NoteFieldAttribute(fieldId, fieldInternalName);
                default:
                    throw new Exception($"Enterprise Property with IndexedType {enterpriseProperty.EnterprisePropertyDataType.IndexedType} is not supported");
            }

        }
    }
}
