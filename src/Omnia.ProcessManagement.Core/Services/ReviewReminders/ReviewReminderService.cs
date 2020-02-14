using Microsoft.SharePoint.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Emails;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.Localization;
using Omnia.Fx.Messaging;
using Omnia.Fx.Models.Emails;
using Omnia.Fx.Models.EnterpriseProperties;
using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Users;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Services.Users;
using Omnia.ProcessManagement.Core.Repositories.ReviewReminders;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessTypes;
using Omnia.ProcessManagement.Models.ProcessTypes.ReviewReminderSchedule;
using Omnia.ProcessManagement.Models.ReviewReminders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ReviewReminders
{
    internal class ReviewReminderService : IReviewReminderService
    {
        IProcessTypeService ProcessTypeService { get; }
        IReviewReminderRepository ReviewReminderRepository { get; }
        IEnterprisePropertyService EnterprisePropertyService { get; }
        IProcessService ProcessService { get; }
        IUserService SharePointUserService { get; }
        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        IMultilingualHelper MultilingualHelper { get; }
        IEmailService EmailService { get; }
        ISharePointListService SharePointListService { get; }
        ILocalizationProvider LocalizationProvider { get; }
        ISharePointPermissionService SharePointPermissionService { get; }
        public ReviewReminderService(IReviewReminderRepository reviewReminderRepository, IProcessTypeService processTypeService,
            IEnterprisePropertyService enterprisePropertyService, IProcessService processService, IUserService spUserService,
            ITeamCollaborationAppsService teamCollaborationAppsService, ISharePointClientContextProvider sharePointClientContextProvider,
            IMultilingualHelper multilingualHelper, IEmailService emailService, ISharePointListService sharePointListService,
            ISharePointPermissionService sharePointPermissionService, ILocalizationProvider localizationProvider)
        {
            ReviewReminderRepository = reviewReminderRepository;
            ProcessTypeService = processTypeService;
            EnterprisePropertyService = enterprisePropertyService;
            ProcessService = processService;
            SharePointUserService = spUserService;
            TeamCollaborationAppsService = teamCollaborationAppsService;
            SharePointClientContextProvider = sharePointClientContextProvider;
            MultilingualHelper = multilingualHelper;
            EmailService = emailService;
            SharePointListService = sharePointListService;
            LocalizationProvider = localizationProvider;
            SharePointPermissionService = sharePointPermissionService;
        }

        public async ValueTask<List<ReviewReminderQueue>> GetActiveQueuesAsync()
        {
            var queues = await ReviewReminderRepository.GetActiveQueuesAsync();
            return queues;
        }

        public async ValueTask ProcessQueueAsync(ReviewReminderQueue queue)
        {
            var log = "";
            var publishedProcess = (await ProcessService.GetProcessesByOPMProcessIdAsync(queue.OPMProcessId, ProcessVersionType.Published)).FirstOrDefault();
            if (publishedProcess == null)
            {
                log = $"Published-process with OPMProcessId: {queue.OPMProcessId} not found.";
            }
            else
            {
                var processTypeId = Guid.Parse(publishedProcess.RootProcessStep.EnterpriseProperties[OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName].ToString());
                var processType = (await ProcessTypeService.GetByIdsAsync(processTypeId)).FirstOrDefault();
                if (processType == null || processType.Settings.Type != ProcessTypeSettingsTypes.Item)
                {
                    log = $"ProcessType with id: {processTypeId} not found.";
                }
                else
                {
                    var processTypeSettings = processType.Settings.Cast<ProcessTypeSettings, ProcessTypeItemSettings>();
                    if (processTypeSettings.ReviewReminder == null)
                    {
                        log = $"ProcessType with id: {processTypeId} is no longer setup review-reminder.";
                    }
                    else
                    {
                        log = await ProcessQueueAsync(queue, publishedProcess, processTypeSettings.ReviewReminder);
                    }
                }
            }

            await ReviewReminderRepository.DoneQueueAsync(queue.Id, log);
        }

        public async ValueTask EnsureReviewReminderAsync(Process process)
        {
            DateTime? reviewDate = null;
            DateTime? reviewReminderDate = null;

            var rootProcessStep = process.RootProcessStep;
            var processEnterpriseProperties = rootProcessStep.EnterpriseProperties;

            var processTypeId = Guid.Parse(processEnterpriseProperties[OPMConstants.Features.OPMDefaultProperties.ProcessType.InternalName].ToString());
            var processType = (await ProcessTypeService.GetByIdsAsync(processTypeId)).FirstOrDefault();

            if (processType != null && processType.Settings.Type == ProcessTypeSettingsTypes.Item)
            {
                var processTypeSettings = processType.Settings.Cast<ProcessTypeSettings, ProcessTypeItemSettings>();
                if (processTypeSettings.ReviewReminder != null)
                {
                    if (processTypeSettings.ReviewReminder.Schedule.Type == ReviewReminderScheduleTypes.TimeAfterPublishing)
                    {
                        var schedule = processTypeSettings.ReviewReminder.Schedule.Cast<ReviewReminderSchedule, TimeAfterPublishingSchedule>();
                        reviewDate = schedule.Settings.After(DateTime.UtcNow);
                        reviewReminderDate = processTypeSettings.ReviewReminder.ReminderInAdvance.Before(reviewDate.Value);
                    }
                    else if (processTypeSettings.ReviewReminder.Schedule.Type == ReviewReminderScheduleTypes.Property)
                    {
                        var schedule = processTypeSettings.ReviewReminder.Schedule.Cast<ReviewReminderSchedule, PropertySchedule>();
                        if (schedule.DateTimeEnterprisePropertyDefinitionId != null)
                        {
                            var enterpriseProperty = await EnterprisePropertyService.GetByIdAsync(schedule.DateTimeEnterprisePropertyDefinitionId);
                            if (processEnterpriseProperties.TryGetValue(enterpriseProperty.InternalName, out JToken tokenValue) &&
                                tokenValue != null &&
                                DateTime.TryParse(tokenValue.ToString(), out DateTime dateTimeValue))
                            {
                                reviewDate = dateTimeValue;
                                reviewReminderDate = processTypeSettings.ReviewReminder.ReminderInAdvance.Before(reviewDate.Value);
                            }
                        }
                    }

                }
            }

            if (reviewDate.HasValue)
            {
                await ReviewReminderRepository.AddPendingQueueAsync(new ReviewReminderQueue
                {
                    OPMProcessId = process.OPMProcessId,
                    ReviewDate = reviewDate.Value,
                    ReviewReminderDate = reviewReminderDate.Value
                });
            }
        }

        public async ValueTask<string> ProcessQueueAsync(ReviewReminderQueue queue, Process process, ReviewReminder reviewReminder)
        {
            StringBuilder logStrBuilder = new StringBuilder();
            try
            {
                var spUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(process.TeamAppId);
                PortableClientContext ctx = SharePointClientContextProvider.CreateClientContext(spUrl, true);
                ctx.Load(ctx.Web, w => w.Title, w => w.Url);
                await ctx.ExecuteQueryAsync();

                var (usersToSendReminderEmail, usersToAssignTask) = await LoadUsersAsync(ctx, reviewReminder, process);
                var relevantUsers = usersToSendReminderEmail.Concat(usersToAssignTask).Distinct().ToList();
                var userAndProcessTitleDict = await GenerateUserAndProcessTitleDictAsync(ctx, relevantUsers, process);

                if (usersToSendReminderEmail.Count > 0)
                {
                    await SendEmailAsync(ctx, usersToSendReminderEmail, process, userAndProcessTitleDict, queue.ReviewDate, logStrBuilder);
                }

                if (usersToAssignTask.Count > 0)
                {
                    var user = usersToAssignTask.First();
                    var userLanguage = userAndProcessTitleDict[user.LoginName.ToLower()].Item1;

                    string titlePrefix = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ReviewReminderTaskTitle, (uint)userLanguage.LCID);
                    string processTitle = userAndProcessTitleDict[user.LoginName.ToLower()].Item2;

                    string taskTitle = titlePrefix + ": " + processTitle;

                    await CreateTaskAsync(ctx, user, taskTitle, process, reviewReminder.Task, logStrBuilder);
                }

            }
            catch (Exception ex)
            {
                logStrBuilder.AppendLine($"Exception : {ex.Message} - {ex.StackTrace}.");
            }

            return logStrBuilder.ToString();
        }

        private async ValueTask<Dictionary<string, (Fx.Models.Language.Language, string)>> GenerateUserAndProcessTitleDictAsync(PortableClientContext ctx, List<Microsoft.SharePoint.Client.User> users, Process process)
        {
            var dict = new Dictionary<string, (Fx.Models.Language.Language, string)>();

            foreach (var user in users)
            {
                var languageTag = await SharePointUserService.GetLanguageAsync(ctx, user.LoginName, false);
                var title = await MultilingualHelper.GetValue(process.RootProcessStep.Title, languageTag.Name, null);
                dict.Add(user.LoginName.ToLower(), (languageTag, title));
            }

            return dict;
        }

        private async ValueTask<(List<Microsoft.SharePoint.Client.User>, List<Microsoft.SharePoint.Client.User>)> LoadUsersAsync(PortableClientContext ctx, ReviewReminder reviewReminder, Process process)
        {
            var (enterpriseProperties, _) = await EnterprisePropertyService.GetAllAsync();
            var userDict = new Dictionary<string, Microsoft.SharePoint.Client.User>();

            var enterprisePropertiesToSendReminderEmail = new List<EnterprisePropertyDefinition>();

            var usersToSendReminderEmail = new List<Microsoft.SharePoint.Client.User>();
            var usersToAssignTask = new List<Microsoft.SharePoint.Client.User>();

            foreach (var personPropertyId in reviewReminder.PersonEnterprisePropertyDefinitionIds)
            {
                var uids = new List<string>();
                if (personPropertyId == ProcessTypeItemSettings.ApproverGroupId)
                {
                    uids.Add(process.PublishedBy);
                }
                else
                {
                    var property = enterpriseProperties.FirstOrDefault(e => e.Id == personPropertyId);
                    if (property != null && process.RootProcessStep.EnterpriseProperties.ContainsKey(property.InternalName) &&
                        process.RootProcessStep.EnterpriseProperties[property.InternalName] != null)
                    {
                        var strValue = process.RootProcessStep.EnterpriseProperties[property.InternalName];
                        var userIdentities = JsonConvert.DeserializeObject<List<UserIdentity>>(strValue.ToString());
                        userIdentities.ForEach(u => uids.Add(u.Uid));
                    }
                }
                uids = uids.Distinct().Where(p => !string.IsNullOrWhiteSpace(p)).Select(p => p.ToLower()).ToList();

                foreach (var uid in uids)
                {
                    if (!userDict.ContainsKey(uid))
                    {
                        var user = ctx.Web.EnsureUser(uid);
                        ctx.Load(user);
                        userDict.Add(uid, user);
                    }
                    usersToSendReminderEmail.Add(userDict[uid]);
                }
            }

            if (reviewReminder.Task != null)
            {
                var property = enterpriseProperties.FirstOrDefault(p => p.Id == reviewReminder.Task.PersonEnterprisePropertyDefinitionId);
                if (property != null && process.RootProcessStep.EnterpriseProperties.ContainsKey(property.InternalName) &&
                        process.RootProcessStep.EnterpriseProperties[property.InternalName] != null)
                {
                    var strValue = process.RootProcessStep.EnterpriseProperties[property.InternalName];
                    var userIdentities = JsonConvert.DeserializeObject<List<UserIdentity>>(strValue.ToString());
                    foreach (var userIdentity in userIdentities)
                    {
                        var uid = userIdentity.Uid.ToLower();
                        if (!userDict.ContainsKey(uid))
                        {
                            var user = ctx.Web.EnsureUser(uid);
                            ctx.Load(user);
                            userDict.Add(uid, user);
                        }

                        usersToAssignTask.Add(userDict[uid]);
                    }
                }
            }

            if (userDict.Count > 0)
            {
                await ctx.ExecuteQueryAsync();
            }

            usersToSendReminderEmail = usersToSendReminderEmail.Where(u => u != null && u.ServerObjectIsNull != true && !string.IsNullOrEmpty(u.Email)).ToList();
            usersToAssignTask = usersToAssignTask.Where(u => u != null && u.ServerObjectIsNull != true).ToList();

            return (usersToSendReminderEmail, usersToAssignTask);
        }

        private async ValueTask SendEmailAsync(PortableClientContext ctx, List<Microsoft.SharePoint.Client.User> users,
            Process process, Dictionary<string, (Fx.Models.Language.Language, string)> userAndProcessTitleDict, DateTimeOffset reviewDate, StringBuilder logStrBuilder)
        {
            var webUrl = ctx.Web.Url;
            string processLink = string.Format(OPMConstants.OPMPages.ProcessPreviewUrl, webUrl, process.RootProcessStep.Id);

            foreach (var user in users)
            {
                var emailInfo = new EmailInfo();

                emailInfo.Subject = OPMConstants.EmailTemplates.ReviewReminder.SubjectLocalizedKey;
                emailInfo.Body.Add(OPMConstants.EmailTemplates.ReviewReminder.BodyLocalizedKey);
                emailInfo.To = new List<string> { user.Email };
                emailInfo.LocalizationSetting.ApplyUserSetting(user.Email);

                var processTitle = userAndProcessTitleDict[user.LoginName.ToLower()].Item2;

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                            {OPMConstants.EmailTemplates.ReviewReminder.Tokens.ProcessTitle,  processTitle },
                            {OPMConstants.EmailTemplates.ReviewReminder.Tokens.ProcessLink, processLink},
                            {OPMConstants.EmailTemplates.ReviewReminder.Tokens.SiteTitle, ctx.Web.Title},
                            {OPMConstants.EmailTemplates.ReviewReminder.Tokens.SiteUrl, ctx.Web.Url},
                            {OPMConstants.EmailTemplates.ReviewReminder.Tokens.Recipient, user.Title},
                        });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                        {OPMConstants.EmailTemplates.ReviewReminder.Tokens.PublishDate,  process.PublishedAt.Value},
                        {OPMConstants.EmailTemplates.ReviewReminder.Tokens.ReviewDate,  reviewDate}
                    });

                await EmailService.SendEmailAsync(emailInfo);

                logStrBuilder.AppendLine($"Sent an email to {user.Email}.");
            }
        }

        private async ValueTask CreateTaskAsync(PortableClientContext ctx, Microsoft.SharePoint.Client.User user, string taskTitle, Process process, ReviewReminderTask task, StringBuilder logStrBuilder)
        {
            DateTime startDate = DateTime.Now;
            DateTime dueDate = task.Expiration.After(startDate);

            Dictionary<string, dynamic> keyValuePairs = new Dictionary<string, object>();
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Title, taskTitle);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_StartDate, DateTime.Now);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_DueDate, dueDate);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To, user.Id);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.ContentTypeId, OPMConstants.OPMContentTypeId.CTReviewReminderTaskStringId);
            keyValuePairs.Add(OPMConstants.SharePoint.OPMFields.Fields_ProcessId, process.OPMProcessId);

            Microsoft.SharePoint.Client.List taskList = await SharePointListService.GetListByUrlAsync(ctx, OPMConstants.SharePoint.ListUrl.TaskList);
            Microsoft.SharePoint.Client.ListItem taskListItem = await SharePointListService.AddListItemAsync(ctx, taskList, keyValuePairs);

            logStrBuilder.AppendLine($"Created a sp task to {user.LoginName}.");

            Dictionary<Principal, List<RoleType>> roleAssignments = new Dictionary<Principal, List<RoleType>>();
            roleAssignments.Add(user, new List<RoleType> { RoleType.Contributor });
            await SharePointPermissionService.BreakListItemPermissionAsync(ctx, taskListItem, false, false, roleAssignments);

            logStrBuilder.AppendLine($"Ensure {user.LoginName} has contributor permission on the created task item.");
        }

    }
}

