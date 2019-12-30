using Microsoft.SharePoint.Client;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Emails;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Emails;
using Omnia.Fx.Models.Language;
using Omnia.Fx.MultilingualTexts;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.SharePoint.Services.Users;
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
        IUserService SPUSerService { get; }
        ISharePointListService SharePointListService { get; }
        ILocalizationProvider LocalizationProvider { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        IEmailService EmailService { get; }
        IOmniaScopedContext OmniaScopedContext { get; }
        IMultilingualHelper MultilingualHelper { get; }
        ISharePointGroupService SharePointGroupService { get; }
        ISettingsService SettingsService { get; }
        ISharePointPermissionService SharePointPermissionService { get; }

        public ApprovalTaskService(ISharePointClientContextProvider sharePointClientContextProvider,
          IWorkflowService workflowService,
          ISharePointListService sharePointListService,
          ILocalizationProvider localizationProvider,
          IEmailService emailService,
          IOmniaScopedContext omniaScopedContext,
          IMultilingualHelper multilingualHelper,
          ISharePointGroupService sharePointGroupService,
          ISharePointPermissionService sharePointPermissionService,
          ISettingsService settingsService,
          IUserService spUSerService)
        {
            WorkflowService = workflowService;
            SharePointListService = sharePointListService;
            LocalizationProvider = localizationProvider;
            SharePointClientContextProvider = sharePointClientContextProvider;
            EmailService = emailService;
            OmniaScopedContext = omniaScopedContext;
            MultilingualHelper = multilingualHelper;
            SharePointGroupService = sharePointGroupService;
            SharePointPermissionService = sharePointPermissionService;
            SettingsService = settingsService;
            SPUSerService = spUSerService;
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
                throw new Exception("Missing Process Author SharePoint group");

            PortableClientContext appCtx = SharePointClientContextProvider.CreateClientContext(webUrl, true);

            var authorGroup = await SharePointGroupService.TryGetGroupByIdAsync(appCtx, appCtx.Site.RootWeb, siteGroupIdSettings.AuthorGroupId);
            if (authorGroup == null)
                throw new Exception($"Cannot get Process Author SharePoint group with id: {siteGroupIdSettings.AuthorGroupId}");

            var approverSPUser = appCtx.Web.EnsureUser(workflowApprovalData.Approver.Uid);
            var authorSPUser = appCtx.Web.EnsureUser(workflow.CreatedBy);

            appCtx.Load(approverSPUser, us => us.Title, us => us.LoginName, us => us.Email, us => us.Id, us => us.UserPrincipalName);
            appCtx.Load(authorSPUser, us => us.Id, us => us.Title);
            await appCtx.ExecuteQueryAsync();

            var language = await SPUSerService.GetLanguageAsync(appCtx, approverSPUser.LoginName, false);
            var preferredLanguage = language.Name;
            var lcid = (uint)language.LCID;

            string processTitle = await MultilingualHelper.GetValue(process.RootProcessStep.Title, preferredLanguage, null);
            string titleFormat = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ApprovalTaskTitlePrefix, lcid);
            string taskTitle = titleFormat + ": " + processTitle;

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
                new List<RoleDefinition> { appCtx.Site.RootWeb.RoleDefinitions.GetByType(RoleType.Reader) }, null, new List<User> { approverSPUser });

            Dictionary<Principal, List<RoleType>> taskItemRoleAssignments = new Dictionary<Principal, List<RoleType>>();
            taskItemRoleAssignments.Add(temporaryApprovalGroup, new List<RoleType> { RoleType.Contributor });
            taskItemRoleAssignments.Add(authorGroup, new List<RoleType> { RoleType.Reader });

            await SharePointPermissionService.BreakListItemPermissionAsync(appCtx, taskListItem, false, false, taskItemRoleAssignments);

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

            string temporaryApprovalGroupTitle = OPMConstants.TemporaryGroupPrefixes.ApproversGroup + process.OPMProcessId.ToString().ToLower();
            await SharePointGroupService.EnsureRemoveGroupOnWebAsync(appContext, appContext.Web, temporaryApprovalGroupTitle);

            var approver = workflow.WorkflowTasks.Select(d => d.AssignedUser).FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(approver))
            {
                var approverSPUser = appContext.Web.EnsureUser(approver);
                appContext.Load(approverSPUser, u => u.Title, u => u.Email, u => u.UserPrincipalName);
                await appContext.ExecuteQueryAsync();

                await SendCancellWorkflowEmail(workflow, process, approverSPUser, webUrl);
            }
        }

        public async ValueTask CompleteSharePointTaskAsync(WorkflowTask approvalTask, Process process, string webUrl)
        {
            PortableClientContext appContext = SharePointClientContextProvider.CreateClientContext(webUrl, true);
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
            string temporaryApprovalGroupTitle = OPMConstants.TemporaryGroupPrefixes.ApproversGroup + process.OPMProcessId.ToString().ToLower();
            await SharePointGroupService.EnsureRemoveGroupOnWebAsync(appContext, appContext.Web, temporaryApprovalGroupTitle);
        }

        private async ValueTask SendForApprovalEmailAsync(Workflow workflow, WorkflowApprovalData workflowApprovalData, User approverSPUser, User authorSPUser, string processTitle, string taskTitle, int taskListItemId, string webUrl)
        {
            if (!string.IsNullOrEmpty(approverSPUser.Email))
            {
                string taskLink = string.Format(OPMConstants.OPMPages.ApprovalTaskUrl, webUrl, taskListItemId);
                string processLink = string.Format(OPMConstants.OPMPages.ProcessPreviewUrl, webUrl);

                var emailInfo = new EmailInfo();
                emailInfo.Subject = OPMConstants.EmailTemplates.SendForApproval.SubjectLocalizedKey;

                emailInfo.Body.Add(OPMConstants.EmailTemplates.SendForApproval.BodyLocalizedKey);


                if (!string.IsNullOrEmpty(workflowApprovalData.Comment))
                {
                    emailInfo.Body.Add(OPMConstants.EmailTemplates.SendForApproval.AuthorEditionCommentLocalizedKey);
                }

                emailInfo.Subject = OPMConstants.EmailTemplates.SendForApproval.SubjectLocalizedKey;

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.ApproverName,  approverSPUser.Title},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.AuthorName,  authorSPUser.Title},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.Message,  workflowApprovalData.Comment},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.ProcessLink,  processLink},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.ProcessTitle,  processTitle},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.TaskLink,  taskLink},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.TaskTitle,  taskTitle}
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.DueDate,  workflow.DueDate.GetValueOrDefault()},
                    {OPMConstants.EmailTemplates.SendForApproval.Tokens.StartDate,  DateTime.Now}
                });

                emailInfo.To = new List<string> { approverSPUser.Email };
                emailInfo.LocalizationSetting.ApplyUserSetting(approverSPUser.UserPrincipalName);
                emailInfo.SpUrl = webUrl;
                await EmailService.SendEmailAsync(emailInfo);
            }
        }

        private async ValueTask SendCancellWorkflowEmail(Workflow workflow, Process process, User approverSPUser, string webUrl)
        {

            foreach (WorkflowTask workflowTask in workflow.WorkflowTasks)
            {
                if (!string.IsNullOrEmpty(approverSPUser.Email))
                {
                    var emailInfo = new EmailInfo();
                    emailInfo.Subject = OPMConstants.EmailTemplates.CancelApproval.SubjectLocalizedKey;
                    emailInfo.Body.Add(OPMConstants.EmailTemplates.CancelApproval.BodyLocalizedKey);

                    emailInfo.LocalizationSetting.ApplyUserSetting(approverSPUser.UserPrincipalName);

                    emailInfo.UseMultilingualTokenInfo(OmniaScopedContext.BusinessProfileId)
                    .AddTokenMultilingualValues(new Dictionary<string, MultilingualString>
                    {
                        {OPMConstants.EmailTemplates.CancelApproval.Tokens.ProcessTitle, process.RootProcessStep.Title }
                    });

                    emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                            { OPMConstants.EmailTemplates.CancelApproval.Tokens.ApproverName,  approverSPUser.Title }
                        });

                    emailInfo.To = new List<string> { approverSPUser.Email };
                    emailInfo.SpUrl = webUrl;
                    await EmailService.SendEmailAsync(emailInfo);
                }
            }
        }

        public async ValueTask SendCompletedEmailAsync(WorkflowTask task, Process process, string webUrl)
        {
            PortableClientContext appCtx = SharePointClientContextProvider.CreateClientContext(webUrl, true);
            string emailTemplate = string.Empty;
            string emailTitle = string.Empty;

            var author = appCtx.Web.EnsureUser(task.CreatedBy);
            var approver = appCtx.Web.EnsureUser(task.CreatedBy);

            appCtx.Load(author, us => us.Title, us => us.LoginName, us => us.Email, us => us.Id, us => us.UserPrincipalName);
            appCtx.Load(approver, us => us.Id, us => us.Title);
            await appCtx.ExecuteQueryAsync();

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
                    emailTemplate = OPMConstants.EmailTemplates.CompleteApproval.ApproveBodyLocalizedKey;
                }
                else
                {
                    emailTemplate = OPMConstants.EmailTemplates.CompleteApproval.ApproveBodyNoCommentLocalizedKey;
                }
                emailTitle = OPMConstants.EmailTemplates.CompleteApproval.ApproveSubjectLocalizedKey;
            }
            else
            {
                emailTemplate = OPMConstants.EmailTemplates.CompleteApproval.RejectBodyLocalizedKey;
                emailTitle = OPMConstants.EmailTemplates.CompleteApproval.RejectSubjectLocalizedKey;
            }

            if (!string.IsNullOrEmpty(author.Email))
            {
                var emailInfo = new EmailInfo();
                emailInfo.Subject = emailTitle;
                emailInfo.Body.Add(emailTemplate);
                emailInfo.LocalizationSetting.ApplyUserSetting(author.UserPrincipalName);

                emailInfo.UseMultilingualTokenInfo(OmniaScopedContext.BusinessProfileId)
                   .AddTokenMultilingualValues(new Dictionary<string, MultilingualString>
                   {
                        {OPMConstants.EmailTemplates.CompleteApproval.Tokens.ProcessTitle, process.RootProcessStep.Title }
                   });

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.CompleteApproval.Tokens.AuthorName,  author.Title},
                    {OPMConstants.EmailTemplates.CompleteApproval.Tokens.ApproverName,  approver.Title},
                    {OPMConstants.EmailTemplates.CompleteApproval.Tokens.ApproverComment,  task.Comment }
                });


                emailInfo.To = new List<string> { author.Email };
                emailInfo.SpUrl = webUrl;

                await EmailService.SendEmailAsync(emailInfo);
            }
        }
    }
}
