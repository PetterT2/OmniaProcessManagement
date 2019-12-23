using Microsoft.SharePoint.Client;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Emails;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Emails;
using Omnia.Fx.Models.Language;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Helpers.Processes;
using Omnia.ProcessManagement.Core.Services.Settings;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Settings;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Omnia.Fx.Emails.HttpContract;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class ApprovalTaskService : IApprovalTaskService
    {
        IWorkflowService WorkflowService { get; }
        IWorkflowTaskService WorkflowTaskService { get; }
        ISharePointListService SharePointListService { get; }
        ILocalizationProvider LocalizationProvider { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        IUserService UserService { get; }
        IEmailService EmailService { get; }
        IOmniaScopedContext OmniaScopedContext { get; }
        IMultilingualHelper MultilingualHelper { get; }
        ISharePointGroupService SharePointGroupService { get; }
        ISettingsService SettingsService { get; }
        ISharePointPermissionService SharePointPermissionService { get; }
        public ApprovalTaskService(ISharePointClientContextProvider sharePointClientContextProvider,
          IWorkflowService workflowService,
          IWorkflowTaskService workflowTaskService,
          ISharePointListService sharePointListService,
          ILocalizationProvider localizationProvider,
          IEmailService emailService,
          IUserService userService,
          IOmniaScopedContext omniaScopedContext,
          IMultilingualHelper multilingualHelper,
          ISharePointGroupService sharePointGroupService,
          ISharePointPermissionService sharePointPermissionService,
          ISettingsService settingsService)
        {
            WorkflowService = workflowService;
            WorkflowTaskService = workflowTaskService;
            SharePointListService = sharePointListService;
            LocalizationProvider = localizationProvider;
            SharePointClientContextProvider = sharePointClientContextProvider;
            UserService = userService;
            EmailService = emailService;
            OmniaScopedContext = omniaScopedContext;
            MultilingualHelper = multilingualHelper;
            SharePointGroupService = sharePointGroupService;
            SharePointPermissionService = sharePointPermissionService;
            SettingsService = settingsService;
        }

        public async ValueTask AddWorkflowAsync(PublishProcessWithApprovalRequest request)
        {
            Workflow workflow = new Workflow
            {
                Id = Guid.NewGuid(),
                OPMProcessId = request.OPMProcessId,
                //the edition initial value is 0, will be updated to correct value when publish the draft-process. 
                //Or will be removed when delete the draft-process
                Edition = 0,
                DueDate = request.DueDate,
                CompletedType = WorkflowCompletedType.None,
                WorkflowData = new WorkflowApprovalData
                {
                    Comment = request.Comment,
                    IsRevisionPublishing = request.IsRevisionPublishing,
                    IsLimitedAccess = request.IsLimitedAccess,
                    LimitedUsers = request.LimitedUsers,
                    Approver = request.Approver
                }
            };

            await WorkflowService.CreateAsync(workflow);
        }

        public async ValueTask<int> AddSharePointTaskAndSendEmailAsync(Workflow workflow, WorkflowApprovalData workflowApprovalData, Process process, string webUrl)
        {
            var siteGroupIdSettings = await SettingsService.GetAsync<SiteGroupIdSettings>(process.TeamAppId.ToString());

            if (siteGroupIdSettings == null)
                throw new Exception("Cannot get Author SharePoint group");

            PortableClientContext appCtx = SharePointClientContextProvider.CreateClientContext(webUrl, true);

            var authorGroup = await SharePointGroupService.TryGetGroupByIdAsync(appCtx, appCtx.Site.RootWeb, siteGroupIdSettings.AuthorGroupId);
            if (authorGroup == null)
                throw new Exception($"Cannot get Author SharePoint group with id: {siteGroupIdSettings.AuthorGroupId}");

            var approverSPUser = appCtx.Web.EnsureUser(workflowApprovalData.Approver.Uid);
            var authorSPUser = appCtx.Web.EnsureUser(workflow.CreatedBy);

            appCtx.Load(approverSPUser, us => us.Title, us => us.LoginName, us => us.Email, us => us.Id, us => us.UserPrincipalName);
            appCtx.Load(authorSPUser, us => us.Id, us => us.Title);
            await appCtx.ExecuteQueryAsync();

            //var approverUser = (await UserService.GetByPrincipalNamesAsync(new List<string> { workflowApprovalData.Approver.Uid })).FirstOrDefault();

            //if (approverUser == null)
            //    throw new Exception($"Cannot resolve approver: {approverUser}");

            //TODO- having issue that cannot get user from graph api in worker
            LanguageTag? preferedLanguage = LanguageTag.EnUs;


            var lcid = OPMUtilities.GetLcidFromLanguage(preferedLanguage);

            string processTitle = preferedLanguage.HasValue ?
                await MultilingualHelper.GetValue(process.RootProcessStep.Title, preferedLanguage.Value, null) :
                await MultilingualHelper.GetDafaultValue(process.RootProcessStep.Title, null);
            string titleFormat = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.ApprovalTaskTitle, lcid);
            string taskTitle = string.Format(titleFormat, processTitle);
            Dictionary<string, dynamic> keyValuePairs = new Dictionary<string, object>();
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Title, taskTitle);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_StartDate, DateTime.Now);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_DueDate, workflow.DueDate);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To, approverSPUser.Id);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.ContentTypeId, OPMConstants.OPMContentTypeId.CTApprovalTaskStringId);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_Author, authorSPUser.Id);
            List taskList = await SharePointListService.GetListByUrlAsync(appCtx, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskListItem = await SharePointListService.AddListItemAsync(appCtx, taskList, keyValuePairs);

            string temporaryApprovalGroupTitle = OPMConstants.TemporaryGroupPrefixes.ApproversGroup + process.OPMProcessId.ToString().ToLower();
            var temporaryApprovalGroup = await SharePointGroupService.EnsureGroupOnWebAsync(appCtx, appCtx.Web, temporaryApprovalGroupTitle,
                new List<RoleDefinition> { appCtx.Site.RootWeb.RoleDefinitions.GetByType(RoleType.RestrictedReader) }, null, new List<User> { approverSPUser });

            Dictionary<Principal, List<RoleType>> roleAssignments = new Dictionary<Principal, List<RoleType>>();
            roleAssignments.Add(temporaryApprovalGroup, new List<RoleType> { RoleType.Contributor });
            roleAssignments.Add(authorGroup, new List<RoleType> { RoleType.Reader });

            await SharePointPermissionService.BreakListItemPermissionAsync(appCtx, taskListItem, false, false, roleAssignments);

            await SendForApprovalEmailAsync(workflow, workflowApprovalData, approverSPUser, authorSPUser, processTitle, taskTitle, taskListItem.Id, webUrl);

            return taskListItem.Id;
        }

        public async ValueTask CancelSharePointTaskAndSendEmailAsync(Workflow workflow, Process process, string webUrl)
        {
            PortableClientContext appContext = SharePointClientContextProvider.CreateClientContext(webUrl, true);
            List taskList = await SharePointListService.GetListByUrlAsync(appContext, OPMConstants.SharePoint.ListUrl.TaskList);
            var workflowTask = workflow.WorkflowTasks.FirstOrDefault();
            if (workflowTask == null)
            {
                throw new Exception($"Workflow task not found in approval workflow: {workflow.Id}");
            }

            ListItem taskListItem = taskList.GetItemById(workflowTask.SPTaskId);
            taskListItem[OPMConstants.SharePoint.SharePointFields.Fields_Status] = Models.Workflows.TaskStatus.Cancel.ToString();
            taskListItem[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete] = 1;
            taskListItem.Update();
            await appContext.ExecuteQueryAsync();

            var approvalUser = appContext.Web.EnsureUser(workflowTask.AssignedUser);
            Dictionary<Principal, List<RoleType>> roleAssignments = new Dictionary<Principal, List<RoleType>>();
            roleAssignments.Add(approvalUser, new List<RoleType> { RoleType.Reader });

            await SharePointPermissionService.BreakListItemPermissionAsync(appContext, taskListItem, false, false, roleAssignments);
            string temporaryApprovalGroupTitle = OPMConstants.TemporaryGroupPrefixes.ApproversGroup + process.OPMProcessId.ToString().ToLower();
            await SharePointGroupService.EnsureRemoveGroupOnWebAsync(appContext, appContext.Web, temporaryApprovalGroupTitle);

            await SendCancellWorkflowEmail(workflow, process);
        }

        public async ValueTask CompleteSharePointTaskAsync(WorkflowApprovalTask approvalTask, string webUrl)
        {
            PortableClientContext appContext = SharePointClientContextProvider.CreateClientContext(webUrl);
            List taskList = await SharePointListService.GetListByUrlAsync(appContext, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskItem = taskList.GetItemById(approvalTask.SPTaskId);
            appContext.Load(taskItem,
                it => it.Id,
                it => it[OPMConstants.SharePoint.SharePointFields.Fields_Status],
                it => it[OPMConstants.SharePoint.OPMFields.Fields_Comment],
                it => it[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete],
                it => it[OPMConstants.SharePoint.OPMFields.Fields_TaskOutcome]);
            await appContext.ExecuteQueryAsync();

            taskItem[OPMConstants.SharePoint.SharePointFields.Fields_Status] = Models.Workflows.TaskStatus.Completed.ToString();
            taskItem[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete] = 1;
            taskItem[OPMConstants.SharePoint.OPMFields.Fields_Comment] = approvalTask.Comment;
            taskItem[OPMConstants.SharePoint.OPMFields.Fields_TaskOutcome] = approvalTask.TaskOutcome;
            taskItem.Update();
            await appContext.ExecuteQueryAsync();

            var approvalUser = appContext.Web.EnsureUser(approvalTask.AssignedUser);
            Dictionary<Principal, List<RoleType>> roleAssignments = new Dictionary<Principal, List<RoleType>>();
            roleAssignments.Add(approvalUser, new List<RoleType> { RoleType.Reader });

            await SharePointPermissionService.BreakListItemPermissionAsync(appContext, taskItem, false, false, roleAssignments);
            string temporaryApprovalGroupTitle = OPMConstants.TemporaryGroupPrefixes.ApproversGroup + approvalTask.Process.OPMProcessId.ToString().ToLower();
            await SharePointGroupService.EnsureRemoveGroupOnWebAsync(appContext, appContext.Web, temporaryApprovalGroupTitle);
        }

        private async ValueTask SendForApprovalEmailAsync(Workflow workflow, WorkflowApprovalData workflowApprovalData, User approverSPUser, User authorSPUser, string processTitle, string taskTitle, int taskListItemId, string webUrl)
        {
            if (!string.IsNullOrEmpty(approverSPUser.Email))
            {
                string taskUrl = string.Format(OPMConstants.OPMPages.ApprovalTaskUrl, webUrl, taskListItemId);
                string emailTemplate = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyLocalizedKey;
                string previewProcessLink = string.Format(OPMConstants.EmailTemplates.LinkHtmlTemplate, string.Format(OPMConstants.OPMPages.ProcessPreviewUrl, webUrl), processTitle);

                if (!string.IsNullOrEmpty(workflowApprovalData.Comment))
                {
                    emailTemplate += OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.ApprovalEditionCommentTemplateKey;
                }
                var emailInfo = new EmailInfo();
                emailInfo.Subject = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectLocalizedKey;
                emailInfo.Body.Add(emailTemplate);

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Name,  processTitle},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Author,  authorSPUser.Title},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Approver,  approverSPUser.Title },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.ProcessLink, previewProcessLink },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Message,  workflowApprovalData.Comment},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.TaskTitle,  string.Format(OPMConstants.EmailTemplates.LinkHtmlTemplate, taskUrl, taskTitle) }
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.DueDate,  workflow.DueDate.GetValueOrDefault()},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.StartDate,  DateTime.Now}
                });
                emailInfo.To = new List<string> { approverSPUser.Email };
                emailInfo.LocalizationSetting.ApplyUserSetting(approverSPUser.UserPrincipalName);
                await EmailService.SendEmailAsync(emailInfo);
            }
        }

        private async ValueTask SendCancellWorkflowEmail(Workflow workflow, Process process)
        {
            List<Fx.Models.Users.User> userApprovers = await UserService.GetByPrincipalNamesAsync(workflow.WorkflowTasks.Select(d => d.AssignedUser).ToList());
            foreach (WorkflowTask workflowTask in workflow.WorkflowTasks)
            {
                Fx.Models.Users.User fxUser = userApprovers.FirstOrDefault(r => workflowTask.AssignedUser.ToLower().Equals(r.UserPrincipalName.ToLower()));
                //TODO: currently cannot get this from graph api in app context
                if (fxUser != null && !string.IsNullOrEmpty(fxUser.Mail))
                {
                    var emailInfo = new EmailInfo();
                    emailInfo.Subject = OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.SubjectLocalizedKey;
                    emailInfo.Body.Add(OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.BodyLocalizedKey);
                    emailInfo.LocalizationSetting.ApplyUserSetting(fxUser.UserPrincipalName);

                    emailInfo.UseMultilingualTokenInfo(OmniaScopedContext.BusinessProfileId)
                    .AddTokenMultilingualValues(new Dictionary<string, MultilingualString>
                    {
                        {OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.Tokens.Name, process.RootProcessStep.Title }
                    });

                    emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                            { OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.Tokens.Approver,  string.Join(", ", userApprovers.Select(r => r.DisplayName)) }
                        });

                    emailInfo.To = new List<string> { fxUser.Mail };
                    await EmailService.SendEmailAsync(emailInfo);
                }
            }
        }

        public async ValueTask SendCompletedEmailAsync(WorkflowApprovalTask task)
        {
            string emailTemplate = string.Empty;
            string emailTitle = string.Empty;

            var users = await UserService.GetByPrincipalNamesAsync(new List<string> { task.CreatedBy, task.AssignedUser });
            var author = users.FirstOrDefault(u => u.UserPrincipalName.ToLower() == task.CreatedBy);
            var approver = users.FirstOrDefault(u => u.UserPrincipalName.ToLower() == task.AssignedUser);

            if (author == null)
            {
                throw new Exception($"Cannot resolve Author: {task.CreatedBy}");
            }

            if (approver == null)
            {
                throw new Exception($"Cannot resolve Approver: {task.AssignedUser}");
            }

            if (task.TaskOutcome == TaskOutcome.Approved)
            {
                if (!string.IsNullOrEmpty(task.Comment))
                {
                    emailTemplate = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyApprovalKey;
                }
                else
                {
                    emailTemplate = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyApprovalNoCommentKey;
                }
                emailTitle = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectApprovalKey;
            }
            else
            {
                emailTemplate = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyRejectKey;
                emailTitle = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectRejectKey;
            }

            if (!string.IsNullOrEmpty(author.Mail))
            {
                var emailInfo = new EmailInfo();
                emailInfo.Subject = emailTitle;
                emailInfo.Body.Add(emailTemplate);
                emailInfo.LocalizationSetting.ApplyUserSetting(author.UserPrincipalName);

                emailInfo.UseMultilingualTokenInfo(OmniaScopedContext.BusinessProfileId)
                   .AddTokenMultilingualValues(new Dictionary<string, MultilingualString>
                   {
                        {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Name, task.Process.RootProcessStep.Title }
                   });

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Author,  author.DisplayName},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Approver,  approver.DisplayName },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.ApproverComment,  task.Comment }
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.DueDate,  task.Workflow.DueDate.Value},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.StartDate, task.Workflow.CreatedAt}
                });

                emailInfo.To = new List<string> { approver.Mail };
                await EmailService.SendEmailAsync(emailInfo);
            }
        }
    }
}
