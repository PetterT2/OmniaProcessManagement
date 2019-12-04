using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.SharePoint.Client;
using Microsoft.SharePoint.Client.Taxonomy;
using Omnia.Fx.Extensions;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.BusinessProfiles.PropertyBag;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Security;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.NetCore.Worker;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Models.AppSettings;
using Omnia.Fx.SharePoint.Services.Terms;
using Omnia.Fx.Tenant;
using Omnia.Fx.Users;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs
{
    internal class ProcessTypeTermSynchronizationTimerJob : LifetimeEventsHostedService
    {
        internal class SyncHandler
        {
            public ITenantService TenantService { get; set; }
            public IOmniaUserTokenProvider OmniaUserTokenProvider { get; set; }
            public TaxonomySession TaxonomySession { get; set; }
            public TermSet TermSet { get; set; }
            public TermStore TermStore { get; set; }
            public IList<Term> Terms { get; set; }
            public PortableClientContext Ctx { get; set; }
            public IMultilingualHelper MultilingualHelper { get; set; }
            public LanguageTag DefaultLanguageTag { get; set; }
            public HashSet<LanguageTag> TermStoreAvailableLanguageTagHashSet { get; set; }
            public Dictionary<LanguageTag, int> LanguageTagToLCID { get; set; }
        }

        private static object _lock = new object();
        private static Dictionary<string, string> _omniaTokenKeyUpdatedProcessType = new Dictionary<string, string>();
        private static DateTimeOffset _latestTimeUpdateOmniaTokenKeyUpdatedProcessType = DateTimeOffset.UtcNow;

        private IServiceScopeFactory ServiceScopeFactory { get; }
        private ILogger<ProcessTypeTermSynchronizationTimerJob> Logger { get; }
        private IOptionsMonitor<SharePointAppSettings> SPAppSettings { get; }
        private Timer _timer;
        private int _millisecondsUtilNextRun = 30000; //1 minutes
        private DateTimeOffset _lastTimeRunSync = DateTimeOffset.MinValue;

        public ProcessTypeTermSynchronizationTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            IOptionsMonitor<SharePointAppSettings> spAppSettings,
            IMessageBus messageBus,
            ILogger<ProcessTypeTermSynchronizationTimerJob> logger) : base(appLifetime)
        {
            Logger = logger;
            ServiceScopeFactory = serviceScopeFactory;
            SPAppSettings = spAppSettings;

            ValidateAppSettings();
            EnsureSubscribeUpdateUserOmniaTokenKeyInWorker(messageBus);
        }

        public override Task OnStarted()
        {
            _timer = new Timer((state) =>
            {
                _ = TimerRun();
            }, null, 0, Timeout.Infinite);

            return Task.CompletedTask;
        }

        public override Task OnStopped()
        {
            return Task.CompletedTask;
        }

        public override Task OnStopping()
        {
            _timer.Dispose();
            return Task.CompletedTask;
        }

        private void ValidateAppSettings()
        {
            if (string.IsNullOrWhiteSpace(SPAppSettings.CurrentValue.AuthorityUrl))
                throw new Exception("Missing AuthorityUrl in SharePoint App Settings");
        }

        private async Task TimerRun()
        {

            try
            {
                if (_lastTimeRunSync < _latestTimeUpdateOmniaTokenKeyUpdatedProcessType)
                {
                    using (var scope = ServiceScopeFactory.CreateScope())
                    {
                        IProcessTypeTermSynchronizationTrackingService trackingService = scope.ServiceProvider.GetRequiredService<IProcessTypeTermSynchronizationTrackingService>();
                        ISettingsService settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();
                        ISharePointClientContextProvider spClientContextProvider = scope.ServiceProvider.GetRequiredService<ISharePointClientContextProvider>();
                        IMultilingualHelper multilingualHelper = scope.ServiceProvider.GetRequiredService<IMultilingualHelper>();
                        ITermService termService = scope.ServiceProvider.GetRequiredService<ITermService>();
                        ITenantService tenantService = scope.ServiceProvider.GetRequiredService<ITenantService>();
                        IProcessTypeService processTypeService = scope.ServiceProvider.GetRequiredService<IProcessTypeService>();
                        Fx.NetCore.Worker.Services.ITokenService tokenService = scope.ServiceProvider.GetService<Fx.NetCore.Worker.Services.ITokenService>();

                        var processTypeTermSetId = await processTypeService.GetProcessTypeTermSetIdAsync();

                        if (processTypeTermSetId != Guid.Empty)
                        {
                            var request = await trackingService.GetTrackingRequestAsync(processTypeTermSetId);


                            var lastTimeRunSync = _latestTimeUpdateOmniaTokenKeyUpdatedProcessType;
                            //There could be some new data come in while we getting tracking status
                            //So make sure we update the time to the LatestModifiedAt to prevent from syncing on same data
                            if (lastTimeRunSync < request.LatestModifiedAt &&
                                request.Type != ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.Synced)
                                lastTimeRunSync = request.LatestModifiedAt;


                            if (request.Type == ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.PendingSyncToSharePoint)
                            {
                                _lastTimeRunSync = lastTimeRunSync;
                                await ProcessSyncToSharePointAsync(request, tokenService, spClientContextProvider, processTypeTermSetId, multilingualHelper, tenantService, trackingService);
                            }
                            else if (request.Type == ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTermSynchronizationTrackingRequestType.PendingSyncFromSharePoint)
                            {
                                await ProcessSyncFromSharePointAsync(request, termService, processTypeService, trackingService);
                                //When syncing from SharePoint, we want it auto retry everytime it failed, so we set _lastTimeRunSync in the last step here
                                _lastTimeRunSync = lastTimeRunSync;
                            }
                        }
                    }

                }
            }
            catch (Exception ex)
            {
                Logger.LogWarning($"sync process type exception: {ex.Message}. {ex.StackTrace}");
            }
            finally
            {
                //ready for next run in _millisecondsUtilNextRun;
                _timer.Change(_millisecondsUtilNextRun, Timeout.Infinite);
            }
        }

        private async ValueTask ProcessSyncFromSharePointAsync(ProcessTypeTermSynchronizationTrackingRequest request,
            ITermService termService, IProcessTypeService processTypeService, IProcessTypeTermSynchronizationTrackingService trackingService)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();

            ProcessTypeTermSynchronizationTrackingResult result = null;
            try
            {
                var termSet = await termService.GetTermSetByIdAsync(request.ProcessTypeRootId, true);
                var terms = termSet.Terms.Where(t => !t.IsReused && !t.IsPinned).ToList();

                if (terms.Count == 0)
                    throw new Exception("There is no terms from Term Set");

                var processTypes = await MapProcessTypeAsync(Guid.Empty, terms);

                await processTypeService.SyncFromSharePointAsync(processTypes);

                stopwatch.Stop();
                result = request.CreateTrackingResult(true, false, "", stopwatch.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                result = request.CreateTrackingResult(false, false, $"Sync from Term Set failed: {ex.Message} - {ex.StackTrace}", stopwatch.ElapsedMilliseconds);
            }
            await trackingService.AddTrackingResultAsync(result);
        }

        private async ValueTask<List<ProcessType>> MapProcessTypeAsync(Guid parentId, List<Fx.Models.Taxonomy.Term> allTerms)
        {
            var processTypes = new List<ProcessType>();
            var terms = allTerms.Where(t => t.ParentId == parentId).ToList();
            foreach (var term in terms)
            {
                ProcessType processType = new ProcessType
                {
                    Id = term.Id,
                    ParentId = parentId == Guid.Empty ? term.TermSetId : parentId,
                    Title = new MultilingualString()
                };

                foreach (var label in term.Labels)
                {
                    var language = CultureUtils.GetCultureInfo(label.Lcid);
                    if (language != null && !processType.Title.ContainsKey(language.Name))
                    {
                        processType.Title.Add(language.Name, label.Label);
                    }
                }

                if (term.IsAvailableForTagging && term.TermsCount == 0)
                {
                    processType.Settings = new ProcessTypeItemSettings
                    {
                        TermSetId = term.TermSetId,
                        PropertySetItemSettings = new Dictionary<Guid, Models.ProcessTypes.PropertySetItemSettings.PropertySetItemSettings>(),
                        FeedbackRecipientsPropertyDefinitionIds = new List<Guid>()
                    };
                }
                else
                {
                    processType.Settings = new ProcessTypeGroupSettings
                    {
                        TermSetId = term.TermSetId
                    };
                }
                processTypes.Add(processType);
                processTypes.AddRange(await MapProcessTypeAsync(processType.Id, allTerms));
            }

            return processTypes;
        }

        private async ValueTask ProcessSyncToSharePointAsync(ProcessTypeTermSynchronizationTrackingRequest request,
             Fx.NetCore.Worker.Services.ITokenService tokenService, ISharePointClientContextProvider spClientContextProvider,
             Guid processTypeTermSetId, IMultilingualHelper multilingualHelper, ITenantService tenantService, IProcessTypeTermSynchronizationTrackingService trackingService)
        {
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();

            ProcessTypeTermSynchronizationTrackingResult result = null;

            //Try with each omnia token key
            var invalidOmniaTokenKeyUpdatedProcessType = new Dictionary<string, string>();
            var omniaTokenKeyUpdatedProcessType = _omniaTokenKeyUpdatedProcessType.ToDictionary(t => t.Key, t => t.Value);

            foreach (var omniaTokenKeyItem in omniaTokenKeyUpdatedProcessType)
            {
                try
                {
                    var authResult = await tokenService.GetUserAuthValidationResultAsync(omniaTokenKeyItem.Value);
                    var accessToken = TryGetAccessToken(authResult);

                    var (errorMsg, skippedNotAvailableWorkingLanguages) = await TrySyncWithOmniaTokenKeyAsync(accessToken, spClientContextProvider, processTypeTermSetId, multilingualHelper, tenantService, request.ProcessTypeTerms);
                    stopwatch.Stop();
                    result = request.CreateTrackingResult(errorMsg == "", skippedNotAvailableWorkingLanguages, errorMsg, stopwatch.ElapsedMilliseconds);
                    break;

                }
                catch (Exception ex)
                {
                    invalidOmniaTokenKeyUpdatedProcessType.Add(omniaTokenKeyItem.Key, omniaTokenKeyItem.Value);
                }
            }

            if (result == null)
            {
                stopwatch.Stop();
                result = request.CreateTrackingResult(false, false, "There is no any valid user session to sync term", stopwatch.ElapsedMilliseconds);
            }

            await trackingService.AddTrackingResultAsync(result);

            if (invalidOmniaTokenKeyUpdatedProcessType.Count > 0)
            {
                UpdateOmniaTokenKeyUpdatedProcessType(invalidOmniaTokenKeyUpdatedProcessType, true);
            }
        }

        private async ValueTask<(string, bool)> TrySyncWithOmniaTokenKeyAsync(string accessToken, ISharePointClientContextProvider spClientContextProvider, Guid termSetId, IMultilingualHelper multilingualHelper, ITenantService tenantService, List<ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm> allProcessTypeTerms)
        {
            var errorMessagesBuilder = new StringBuilder();
            var syncHandler = await GetSyncHandlerAsync(spClientContextProvider, accessToken, termSetId);
            syncHandler.MultilingualHelper = multilingualHelper;
            syncHandler.TenantService = tenantService;

            var processTypeTerms = allProcessTypeTerms.Where(d => d.ParentId == termSetId).ToList();

            foreach (var processTypeTerm in processTypeTerms)
            {
                await SyncProcessTypeTermRecursiveAsync(processTypeTerm, allProcessTypeTerms, syncHandler, errorMessagesBuilder);
            }

            var errorMessage = errorMessagesBuilder.ToString();
            var skippedNotAvailableWorkingLanguages = false;

            if (errorMessage == "")
            {
                var properties = await syncHandler.TenantService.GetPropertyBag().GetAllValuesAsync();
                var tenantLanguageSettings = properties.GetModel<TenantPropertyLanguage>();
                foreach (var language in tenantLanguageSettings.Languages)
                {
                    if (!syncHandler.TermStoreAvailableLanguageTagHashSet.Contains(language.Name) && syncHandler.DefaultLanguageTag != language.Name)
                    {
                        skippedNotAvailableWorkingLanguages = true;
                        break;
                    }
                }
            }

            return (errorMessage, skippedNotAvailableWorkingLanguages);
        }

        private string TryGetAccessToken(AuthValidationResult authResult)
        {
            if (authResult.Status == Fx.Models.Security.AuthValidationStatus.Valid)
            {
                return authResult.AuthResult.Tokens.GetAccessTokenForResource(SPAppSettings.CurrentValue.AuthorityUrl).AccessToken;
            }
            else
            {
                throw new Exception("Invalid access token");
            }

        }

        private async ValueTask SyncProcessTypeTermRecursiveAsync(ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm processTypeTerm, List<ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm> processTypeTerms, SyncHandler syncHandler, StringBuilder errorMessagesBuilder)
        {
            try
            {
                await SyncToSharePointAsync(processTypeTerm, syncHandler);
                var children = processTypeTerms.Where(t => t.ParentId == processTypeTerm.Id).ToList();
                foreach (var child in children)
                {
                    await SyncProcessTypeTermRecursiveAsync(child, processTypeTerms, syncHandler, errorMessagesBuilder);
                }
            }
            catch (Microsoft.SharePoint.Client.ServerException serverException)
            {
                if (serverException.ServerErrorTypeName == "System.UnauthorizedAccessException")
                {
                    throw serverException;
                }
                else
                {
                    errorMessagesBuilder.AppendLine($"Failed at process type with id {processTypeTerm.Id} and parent id {processTypeTerm.ParentId}: {serverException.Message}. {serverException.StackTrace}. ");
                }
            }
            catch (Exception ex)
            {
                errorMessagesBuilder.AppendLine($"Failed at process type with id {processTypeTerm.Id} and parent id {processTypeTerm.ParentId}: {ex.Message}. {ex.StackTrace}. ");
            }
        }

        private async ValueTask SyncToSharePointAsync(ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm processTypeTerm, SyncHandler syncHandler)
        {
            var term = syncHandler.Terms.FirstOrDefault(t => t.Id == processTypeTerm.Id);
            if (term == null)
            {
                await CreateNewTermAsync(processTypeTerm, syncHandler);
            }
            else
            {
                await UpdateOrMoveTermAsync(processTypeTerm, term, syncHandler);
            }
        }

        private async ValueTask CreateNewTermAsync(ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm processTypeTerm, SyncHandler syncHandler)
        {
            Term createdTerm = null;

            var defaultLanguageTag = syncHandler.DefaultLanguageTag;
            var termName = await syncHandler.MultilingualHelper.GetValue(processTypeTerm.Title, defaultLanguageTag, null);
            if (processTypeTerm.ParentId == syncHandler.TermSet.Id)
            {
                createdTerm = syncHandler.TermSet.CreateTerm(termName,
                    syncHandler.TermStore.DefaultLanguage, processTypeTerm.Id);
            }
            else
            {
                var parentTerm = syncHandler.Terms.FirstOrDefault(t => t.Id == processTypeTerm.ParentId);
                if (parentTerm == null)
                    throw new Exception("parent term not found");

                createdTerm = parentTerm.CreateTerm(termName,
                    syncHandler.TermStore.DefaultLanguage, processTypeTerm.Id);
            }

            syncHandler.TermStore.CommitAll();
            syncHandler.TaxonomySession.UpdateCache();
            syncHandler.Ctx.Load(createdTerm, GetTermPropertiesExpression());
            await syncHandler.Ctx.ExecuteQueryAsync();

            UpdateTermLabel(processTypeTerm, createdTerm, syncHandler);


            createdTerm.IsAvailableForTagging = !processTypeTerm.IsGroup;
            syncHandler.TermStore.CommitAll();
            syncHandler.TaxonomySession.UpdateCache();
            await syncHandler.Ctx.ExecuteQueryAsync();
            syncHandler.Terms.Add(createdTerm);
        }

        private async ValueTask UpdateOrMoveTermAsync(ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm processTypeTerm, Term term, SyncHandler syncHandler)
        {
            if (term.IsReused || term.IsPinned)
            {
                throw new Exception("Pinned term or Reused term is not supported");
            }

            var needToExecuteQuery = false;
            if (CheckIfTitleIsDifferent(processTypeTerm, term, syncHandler))
            {
                UpdateTermLabel(processTypeTerm, term, syncHandler);
                needToExecuteQuery = true;
            }

            if (term.Parent.ServerObjectIsNull == false && term.Parent.Id != processTypeTerm.ParentId ||
                term.Parent.ServerObjectIsNull == true && processTypeTerm.ParentId != syncHandler.TermSet.Id)
            {
                TermSetItem parentTerm = null;
                if (processTypeTerm.ParentId == syncHandler.TermSet.Id)
                {
                    parentTerm = syncHandler.TermSet; ;
                }
                else
                {
                    parentTerm = syncHandler.Terms.FirstOrDefault(t => t.Id == processTypeTerm.ParentId);
                }

                if (parentTerm != null)
                {
                    term.Move(parentTerm);
                    needToExecuteQuery = true;
                }
                else
                {
                    throw new Exception("parent term not found");
                }
            }
            if (needToExecuteQuery)
            {
                syncHandler.TermStore.CommitAll();
                syncHandler.TaxonomySession.UpdateCache();
                await syncHandler.Ctx.ExecuteQueryAsync();
            }
        }

        private bool CheckIfTitleIsDifferent(ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm processTypeTerm, Term term, SyncHandler syncHandler)
        {
            return true;
        }

        private void UpdateTermLabel(ProcessTypeTermSynchronizationTrackingRequest.ProcessTypeTerm processTypeTerm, Term term, SyncHandler syncHandler)
        {
            var a = syncHandler.TermStore.Languages;
            foreach (var title in processTypeTerm.Title)
            {
                if (syncHandler.TermStoreAvailableLanguageTagHashSet.Contains(title.Key))
                {
                    EnsureLanguageNameToLCID(title.Key, syncHandler);
                    var lcid = syncHandler.LanguageTagToLCID[title.Key];
                    Label defaultLabel = term.Labels.FirstOrDefault(label => label.IsDefaultForLanguage && label.Language == lcid);
                    if (defaultLabel == null && !string.IsNullOrWhiteSpace(title.Value))
                    {
                        var labelValue = title.Value.Trim();
                        defaultLabel = term.CreateLabel(labelValue, lcid, true);
                    }
                    else
                    {
                        defaultLabel.Value = title.Value.Trim();
                    }
                }
            }
        }

        private async ValueTask<SyncHandler> GetSyncHandlerAsync(ISharePointClientContextProvider spClientContextProvider, string accessToken, Guid termSetId)
        {
            var ctx = spClientContextProvider.CreateClientContext(SPAppSettings.CurrentValue.AuthorityUrl, accessToken);
            var syncHandler = new SyncHandler();

            syncHandler.LanguageTagToLCID = new Dictionary<LanguageTag, int>();
            syncHandler.TaxonomySession = await CreateTaxonomySessionAsync(ctx);
            syncHandler.TermStore = syncHandler.TaxonomySession.GetDefaultSiteCollectionTermStore();
            syncHandler.TermSet = syncHandler.TermStore.GetTermSet(termSetId);
            syncHandler.Ctx = ctx;
            syncHandler.TermStoreAvailableLanguageTagHashSet = new HashSet<LanguageTag>();

            ctx.Load(syncHandler.TermSet);
            ctx.Load(syncHandler.TermStore);

            var terms = ctx.LoadQuery<Term>(syncHandler.TermSet.GetAllTerms()
                .Include(GetTermPropertiesExpression()));

            await ctx.ExecuteQueryAsync();
            syncHandler.Terms = terms.ToList();

            var defaultFxLanguage = CultureUtils.GetCultureInfo(syncHandler.TermStore.DefaultLanguage);
            if (defaultFxLanguage == null)
            {
                throw new Exception($"Cannot get language for this lcid {syncHandler.TermStore.DefaultLanguage}");
            }
            syncHandler.DefaultLanguageTag = defaultFxLanguage.Name;

            foreach (var language in syncHandler.TermStore.Languages)
            {
                if (language != syncHandler.TermStore.DefaultLanguage)
                {
                    var fxLanguage = CultureUtils.GetCultureInfo(language);
                    if (fxLanguage == null)
                    {
                        throw new Exception($"Cannot get language for this lcid {language}");
                    }

                    syncHandler.TermStoreAvailableLanguageTagHashSet.Add(fxLanguage.Name);
                }
            }

            return syncHandler;
        }

        private async ValueTask<TaxonomySession> CreateTaxonomySessionAsync(PortableClientContext context)
        {
            var taxonomySession = TaxonomySession.GetTaxonomySession(context);

            taxonomySession.UpdateCache();
            await context.ExecuteQueryAsync();
            return taxonomySession;
        }

        private Expression<Func<Term, object>>[] GetTermPropertiesExpression()
        {
            var expressionList = new List<Expression<Func<Term, object>>>()
            {
                t => t.Id,
                t => t.Labels,
                t => t.Name,
                t => t.IsReused,
                t => t.IsPinned,
                t => t.Parent.Id
            };
            return expressionList.ToArray();
        }

        private void EnsureLanguageNameToLCID(LanguageTag name, SyncHandler syncHandler)
        {
            if (!syncHandler.LanguageTagToLCID.ContainsKey(name))
            {
                var language = CultureUtils.GetCultureInfo(name);
                if (language == null)
                    throw new Exception($"Cannot get language for this name {name}");
                syncHandler.LanguageTagToLCID.Add(name, language.LCID);
            }
        }

        private static void EnsureSubscribeUpdateUserOmniaTokenKeyInWorker(IMessageBus messageBus)
        {
            messageBus.SubscribeAsync(OPMConstants.Messaging.Topics.OmniaTokenKeyUpdatedProcessType, async (omniaTokenKeyUpdatedProcessType) =>
            {
                UpdateOmniaTokenKeyUpdatedProcessType(omniaTokenKeyUpdatedProcessType);
                _latestTimeUpdateOmniaTokenKeyUpdatedProcessType = DateTimeOffset.UtcNow;
                await Task.CompletedTask;
            });
        }

        private static void UpdateOmniaTokenKeyUpdatedProcessType(Dictionary<string, string> omniaTokenKeyUpdatedProcessType, bool remove = false)
        {
            lock (_lock)
            {
                foreach (var item in omniaTokenKeyUpdatedProcessType)
                {
                    if (remove)
                    {
                        if (_omniaTokenKeyUpdatedProcessType.TryGetValue(item.Key, out string value))
                        {
                            if (item.Value == value)
                            {
                                _omniaTokenKeyUpdatedProcessType.Remove(item.Key);
                            }
                        }
                    }
                    else
                    {
                        _omniaTokenKeyUpdatedProcessType[item.Key] = item.Value;
                    }
                }
            }
        }
    }
}
