using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.SharePoint.Client;
using Microsoft.SharePoint.Client.Taxonomy;
using Newtonsoft.Json;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Localization;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.Users;
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
using Omnia.ProcessManagement.Core.Services.Images;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
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
        IUnpublishProcessService UnpublishProcessService { get; }
        IImageService ImageService { get; }

        public ProcessSyncingService(IProcessService processService, ITransactionRepository transactionRepository,
            ITeamCollaborationAppsService teamCollaborationAppsService, ISharePointClientContextProvider sharePointClientContextProvider,
            ISharePointListService sharePointListService, IEnterprisePropertyService enterprisePropertyService,
            ISharePointEntityProvider sharePointEntityProvider, ILocalizationProvider localizationProvider,
            IMultilingualHelper multilingualHelper, ISharePointPermissionService sharePointPermissionService,
            IProcessSecurityService processSecurityService, ISettingsService settingsService,
            ISharePointGroupService sharePointGroupService, IImageService imageService,
            IUnpublishProcessService unpublishProcessService)
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
            ImageService = imageService;
            UnpublishProcessService = unpublishProcessService;
        }

        public async ValueTask SyncToSharePointAsync(Process process)
        {
            await TransactionRepository.InitTransactionAsync(async () =>
            {
                await ProcessService.UpdatePublishedProcessWorkingStatusAsync(process.OPMProcessId, ProcessWorkingStatus.None);
                var processDataDict = await ProcessService.GetAllProcessDataAsync(process.Id);
                var imageReferences = await ImageService.GetImageReferencesAsync(process.Id);

                var spUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);

                var processActionModel = new ProcessWithImagesActionModel()
                {
                    Process = process,
                    ProcessData = processDataDict,
                    ImageReferences = imageReferences
                };

                await SyncToSharePointAsync(spUrl, processActionModel);
            });
        }

        private async ValueTask SyncToSharePointAsync(string spUrl, ProcessWithImagesActionModel processActionModel)
        {
            var process = processActionModel.Process;

            var ctx = SharePointClientContextProvider.CreateClientContext(spUrl, true);

            var (enterpriseProperties, cache) = await EnterprisePropertyService.GetAllAsync();
            var enterprisePropertyDict = enterpriseProperties.ToDictionary(e => e.InternalName, e => e);

            var publishedList = await SharePointListService.GetListByUrlAsync(ctx, OPMConstants.SharePoint.ListUrl.PublishList, true);

            var internalNames = process.RootProcessStep.EnterpriseProperties.Keys.ToList();

            var ensuredSharePointNewFields = await EnsureSharePointFieldsAsync(ctx, internalNames, publishedList, OPMConstants.SharePoint.ListUrl.PublishList, enterprisePropertyDict);
            if (ensuredSharePointNewFields)
            {
                ctx = SharePointClientContextProvider.CreateClientContext(spUrl, true);
                ctx.Load(ctx.Web);
                ctx.Load(ctx.Web, w => w.Language);
                publishedList = await SharePointListService.GetListByUrlAsync(ctx, OPMConstants.SharePoint.ListUrl.PublishList, true);
            }

            var folder = await SyncProcessToPublishedListAsync(ctx, publishedList, processActionModel, enterprisePropertyDict);

            if (process.SecurityResourceId == process.OPMProcessId)
            {
                var limitedReadAccessUser = await ProcessSecurityService.EnsureProcessLimitedReadAccessSharePointUsersAsync(ctx, process.OPMProcessId);

                var siteGroupIdSettings = await SettingsService.GetAsync<SiteGroupIdSettings>(process.TeamAppId.ToString());

                if (siteGroupIdSettings == null)
                    throw new Exception("Missing Process Author SharePoint group");

                var authorGroup = await SharePointGroupService.TryGetGroupByIdAsync(ctx, ctx.Site.RootWeb, siteGroupIdSettings.AuthorGroupId);
                if (authorGroup == null)
                    throw new Exception($"Cannot get Process Author SharePoint group with id: {siteGroupIdSettings.AuthorGroupId}");

                Dictionary<Principal, List<RoleType>> roleAssignments = new Dictionary<Principal, List<RoleType>>();
                limitedReadAccessUser.ForEach(user => roleAssignments.Add(user, new List<RoleType> { RoleType.Reader }));
                roleAssignments.Add(authorGroup, new List<RoleType> { RoleType.Reader });

                await SharePointPermissionService.BreakListItemPermissionAsync(ctx, folder.ListItemAllFields, false, false, roleAssignments);
            }
        }

        private async ValueTask<Folder> SyncProcessToPublishedListAsync(PortableClientContext ctx, List publishedList, ProcessWithImagesActionModel processActionModel, Dictionary<string, EnterprisePropertyDefinition> enterprisePropertyDict)
        {
            var process = processActionModel.Process;

            var opmProcessIdFolder = await EnsureNewProcessFolderAsync(ctx, publishedList, process);

            //Sync the images
            var imageFolder = await SharePointListService.EnsureChildFolderAsync(ctx, opmProcessIdFolder, OPMConstants.SharePoint.FolderUrl.Images);
            await SyncProcessImagesAsync(ctx, imageFolder, processActionModel);

            //Sync the process
            //var fileName = $"process-{process.OPMProcessId.ToString("N").ToLower()}";
            var fileName = "process";
            FileCreationInformation newFile = new FileCreationInformation();
            newFile.Url = String.Format("{0}/{1}", opmProcessIdFolder.ServerRelativeUrl, fileName); ;
            newFile.Overwrite = true;
            newFile.Content = new byte[0];
            Microsoft.SharePoint.Client.File addedFile = opmProcessIdFolder.Files.Add(newFile);
            ctx.Load(addedFile);
            await ctx.ExecuteQueryAsync();

            await UpdateProcessFileItemAsync(ctx, publishedList, addedFile.ListItemAllFields, processActionModel, enterprisePropertyDict);

            return opmProcessIdFolder;
        }

        private async ValueTask SyncProcessImagesAsync(PortableClientContext ctx, Folder imageFolder, ProcessWithImagesActionModel processActionModel)
        {
            if (processActionModel.ImageReferences.Any())
            {
                foreach (var imageReference in processActionModel.ImageReferences)
                {
                    var fileName = imageReference.FileName;
                    FileCreationInformation newFile = new FileCreationInformation();
                    newFile.Url = String.Format("{0}/{1}", imageFolder.ServerRelativeUrl, fileName);
                    newFile.Overwrite = true;
                    newFile.ContentStream = await ImageService.GetImageAsync(imageReference, false);
                    imageFolder.Files.Add(newFile);
                }
                await ctx.ExecuteQueryAsync();
            }
        }

        private async ValueTask UpdateProcessFileItemAsync(PortableClientContext ctx, List publishedList, ListItem fileItem, ProcessWithImagesActionModel processActionModel, Dictionary<string, EnterprisePropertyDefinition> enterprisePropertyDict)
        {
            var process = processActionModel.Process;

            var language = CultureUtils.GetCultureInfo((int)ctx.Web.Language);
            var processTitle = await MultilingualHelper.GetValue(process.RootProcessStep.Title, language.Name, null);

            var (userValuesMapToSharePointFieldInternalNameDict, termCollectionMapToSharePointFieldInternalNameDict, termStoreDefaultLanguage) =
                await PrepareSharePointFieldDataAsync(ctx, process, enterprisePropertyDict);

            foreach (var property in process.RootProcessStep.EnterpriseProperties)
            {
                var spField = publishedList.Fields.FirstOrDefault(item => item.InternalName == property.Key);
                var enterpriseProperty = enterprisePropertyDict.GetValueOrDefault(property.Key);
                if (spField != null && enterpriseProperty != null)
                {
                    switch (enterpriseProperty.EnterprisePropertyDataType.IndexedType)
                    {
                        case PropertyIndexedType.Taxonomy:
                            var taxField = ctx.CastTo<TaxonomyField>(spField);
                            var termCollection = termCollectionMapToSharePointFieldInternalNameDict.GetValueOrDefault(spField.InternalName);
                            UpdateTaxonomyField(taxField, fileItem, termCollection, termStoreDefaultLanguage);
                            break;
                        case PropertyIndexedType.Person:
                            var userValues = userValuesMapToSharePointFieldInternalNameDict.GetValueOrDefault(spField.InternalName);
                            UpdatePersonField(spField, fileItem, userValues, spField.InternalName);
                            break;
                        case PropertyIndexedType.Text:
                            fileItem[spField.InternalName] = property.Value.ToString();
                            break;
                        case PropertyIndexedType.Boolean:
                            fileItem[spField.InternalName] = property.Value.ToString() != "true" ? true : false;
                            break;
                        case PropertyIndexedType.DateTime:
                            var dateTimeValue = property.Value.ToString();
                            if (string.IsNullOrWhiteSpace(dateTimeValue))
                            {
                                fileItem[spField.InternalName] = null;
                            }
                            else
                            {
                                fileItem[spField.InternalName] = dateTimeValue;
                            }
                            break;
                        case PropertyIndexedType.Number:
                            if (int.TryParse(property.Value.ToString(), out int numberValue))
                            {
                                fileItem[spField.InternalName] = numberValue;
                            }
                            else
                            {
                                fileItem[spField.InternalName] = null;
                            }

                            break;
                        default:
                            throw new Exception($"Enterprise Property with IndexedType {enterpriseProperty.EnterprisePropertyDataType.IndexedType.ToString()} is not supported");
                    }
                }
            }

            fileItem[OPMConstants.SharePoint.OPMFields.Fields_ProcessId] = processActionModel.Process.OPMProcessId;
            fileItem[OPMConstants.SharePoint.OPMFields.Fields_ProcessData] = JsonConvert.SerializeObject(processActionModel);
            fileItem[OPMConstants.SharePoint.SharePointFields.Title] = processTitle;
            fileItem.Update();
            await ctx.ExecuteQueryAsync();
        }

        private void UpdatePersonField(Field field, ListItem item, List<FieldUserValue> userValues, string internalFieldName)
        {
            if (userValues != null && userValues.Count > 0)
            {
                if (field.TypeAsString == OPMConstants.SharePoint.SharepointType.UserMulti)
                {
                    item[internalFieldName] = userValues;
                }
                else
                {
                    item[internalFieldName] = userValues.First();
                }
            }
            else
            {
                item[internalFieldName] = null;
            }
        }

        private void UpdateTaxonomyField(TaxonomyField taxField, ListItem item, TermCollection termCollection, int lcid)
        {
            if (termCollection != null)
            {
                if (OPMConstants.SharePoint.SharepointType.TaxonomyFieldTypeMulti == taxField.TypeAsString)
                {
                    taxField.SetFieldValueByTermCollection(item, termCollection, lcid);
                }
                else
                {
                    taxField.SetFieldValueByTerm(item, termCollection.FirstOrDefault(), lcid);
                }
            }
            else
            {
                taxField.ValidateSetValue(item, null);
            }
        }

        public async ValueTask<(Dictionary<string, List<FieldUserValue>>, Dictionary<string, TermCollection>, int)> PrepareSharePointFieldDataAsync(PortableClientContext ctx, Process process, Dictionary<string, EnterprisePropertyDefinition> enterprisePropertyDict)
        {
            var userDict = new Dictionary<string, Microsoft.SharePoint.Client.User>();
            var usersMapToSharePointFieldInternalNameDict = new Dictionary<string, List<Microsoft.SharePoint.Client.User>>();
            var userValuesMapToSharePointFieldInternalNameDict = new Dictionary<string, List<FieldUserValue>>();
            var termCollectionMapToSharePointFieldInternalNameDict = new Dictionary<string, TermCollection>();
            var termStoreDefaultLanguage = 0;

            TermStore termStore = null;
            TaxonomySession taxonomySession = null;
            foreach (var property in process.RootProcessStep.EnterpriseProperties)
            {
                var enterpriseProperty = enterprisePropertyDict.GetValueOrDefault(property.Key);

                if (enterpriseProperty?.EnterprisePropertyDataType?.IndexedType == PropertyIndexedType.Taxonomy)
                {
                    var termIds = new List<Guid>();
                    if (property.Value.ToString() != "")
                    {
                        if (property.Key == OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName)
                        {
                            termIds.Add(new Guid(property.Value.ToString()));
                        }
                        else
                        {
                            termIds = property.Value.ToObject<List<Guid>>();
                        }
                    }

                    if (termIds.Count > 0)
                    {
                        if (taxonomySession == null)
                        {
                            taxonomySession = TaxonomySession.GetTaxonomySession(ctx);
                        }

                        TermCollection termCollection = taxonomySession.GetTermsById(termIds.ToArray());
                        ctx.Load(termCollection);
                        termCollectionMapToSharePointFieldInternalNameDict.Add(property.Key, termCollection);
                    }
                }
                else if (enterpriseProperty?.EnterprisePropertyDataType?.IndexedType == PropertyIndexedType.Person)
                {
                    var identities = property.Value.ToString() != "" ? property.Value.ToObject<List<UserIdentity>>() : new List<UserIdentity>();
                    var identitiesNeedToLoad = identities.Where(i => !string.IsNullOrWhiteSpace(i.Uid) && !userDict.ContainsKey(i.Uid)).ToList();


                    foreach (var identity in identitiesNeedToLoad)
                    {
                        var user = ctx.Web.EnsureUser(identity.Uid);
                        ctx.Load(user);
                        userDict.Add(identity.Uid, user);
                    }


                    if (identities.Count > 0)
                    {
                        var users = new List<Microsoft.SharePoint.Client.User>();
                        foreach (var identity in identities)
                        {
                            if (userDict.TryGetValue(identity.Uid, out var user))
                            {
                                users.Add(user);
                            }
                        }
                        usersMapToSharePointFieldInternalNameDict.Add(property.Key, users);
                    }
                }
            }


            if (termCollectionMapToSharePointFieldInternalNameDict.Count > 0)
            {
                termStore = taxonomySession.GetDefaultSiteCollectionTermStore();
                ctx.Load(termStore, t => t.DefaultLanguage);
            }

            if (termCollectionMapToSharePointFieldInternalNameDict.Count > 0 || usersMapToSharePointFieldInternalNameDict.Count > 0)
            {
                await ctx.ExecuteQueryAsync();

                //Throw friendly message if the term is not avaiable on SharePoint
                //This should be the Process Type have not been synced to SharePoint
                var propertyWithUnAvailableTermValue = termCollectionMapToSharePointFieldInternalNameDict.Where(p => p.Value.Count == 0).ToList();
                if (propertyWithUnAvailableTermValue.Count > 0)
                {
                    throw new Exception($"The selected term value for property {propertyWithUnAvailableTermValue[0].Key} is not available on SharePoint!");
                }
            }


            if (termStore != null)
            {
                termStoreDefaultLanguage = termStore.DefaultLanguage;
            }

            if (usersMapToSharePointFieldInternalNameDict.Count > 0)
            {
                foreach (var item in usersMapToSharePointFieldInternalNameDict)
                {
                    var userValues = item.Value.Select(user => new FieldUserValue { LookupId = user.Id }).ToList();
                    userValuesMapToSharePointFieldInternalNameDict.Add(item.Key, userValues);
                }
            }

            return (userValuesMapToSharePointFieldInternalNameDict, termCollectionMapToSharePointFieldInternalNameDict, termStoreDefaultLanguage);
        }


        private async ValueTask<Folder> EnsureNewProcessFolderAsync(PortableClientContext ctx, List publishedList, Process process)
        {
            var folderName = process.OPMProcessId.ToString("N").ToLower();
            try
            {
                var existedFolder = ctx.Web.GetFolderByServerRelativeUrl($"{ctx.Web.ServerRelativeUrl}/{OPMConstants.SharePoint.ListUrl.PublishList}/{folderName}");
                ctx.Load(existedFolder, f => f.Files);
                await ctx.ExecuteQueryAsync();

                // Archive previos edition
                if (existedFolder.Files.Count > 0)
                    await UnpublishProcessService.ProcessUnpublishingAsync(ctx.Web.Url, process);

                existedFolder.DeleteObject();
                await ctx.ExecuteQueryAsync();

            }
            catch (ServerException ex)
            {
                if (ex.ServerErrorTypeName != "System.IO.FileNotFoundException")
                {
                    throw;
                }
            }

            var newFolder = await SharePointListService.EnsureChildFolderAsync(ctx, publishedList.RootFolder, folderName, true);
            return newFolder;
        }

        private async ValueTask<bool> EnsureSharePointFieldsAsync(PortableClientContext appContext, List<string> internalNames,
            Microsoft.SharePoint.Client.List listWithFields, string listRelativeUrl, Dictionary<string, EnterprisePropertyDefinition> enterprisePropertyDict)
        {
            var ensuredNewFields = false;
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
                    if (enterprisePropertyDict.TryGetValue(internalName, out var enterpriseProperty))
                    {
                        enterprisePropertiesNeedToEnsure.Add(enterpriseProperty);
                    }
                    else
                    {
                        throw new Exception("Invalid SharePoint field: cannot find related EnterpriseProperty to ensure to SharePoint library");
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
