using Microsoft.SharePoint.Client;
using Omnia.Fx.Contexts.Scoped;
using Omnia.Fx.Emails;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Emails;
using Omnia.Fx.Models.Language;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
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

        public ApprovalTaskService(ISharePointClientContextProvider sharePointClientContextProvider,
          IWorkflowService workflowService,
          IWorkflowTaskService workflowTaskService,
          ISharePointListService sharePointListService,
          ILocalizationProvider localizationProvider,
          IEmailService emailService,
          IUserService userService,
          IOmniaScopedContext omniaScopedContext)
        {
            WorkflowService = workflowService;
            WorkflowTaskService = workflowTaskService;
            SharePointListService = sharePointListService;
            LocalizationProvider = localizationProvider;
            SharePointClientContextProvider = sharePointClientContextProvider;
            UserService = userService;
            EmailService = emailService;
            OmniaScopedContext = omniaScopedContext;
        }

        public async ValueTask AddApprovalTaskAndSendEmailAsync(PublishProcessWithApprovalRequest request, Process process)
        {
            PortableClientContext appContext = SharePointClientContextProvider.CreateClientContext(request.WebUrl, true);
            User approverUser = appContext.Web.EnsureUser(request.Approver.Uid);
            Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
            appContext.Load(approverUser, us => us.Title, us => us.LoginName, us => us.Email, us => us.Id, us => us.UserPrincipalName);
            await appContext.ExecuteQueryAsync();
            Workflow workflow = new Workflow
            {
                Id = Guid.NewGuid(),
                ProcessId = process.Id,
                DueDate = request.DueDate,
                CompletedType = WorkflowCompletedType.None,
                WorkflowData = new WorkflowApprovalData
                {
                    Type = WorkflowType.PublishWorkflow,
                    Comment = request.Comment,
                    IsRevisionPublishing = request.IsRevisionPublishing,
                    IsLimitedAccess = request.IsLimitedAccess,
                    LimitedUsers = request.LimitedUsers
                }
            };

            var lcid = OPMUtilities.GetLcidFromLanguage(currentUser.PreferredLanguage);
            LanguageTag language = currentUser.PreferredLanguage.HasValue ? currentUser.PreferredLanguage.Value : LanguageTag.EnUs;
            string processTitle = process.RootProcessStep.Title.ContainsKey(language) ? process.RootProcessStep.Title[language] : process.RootProcessStep.Title[LanguageTag.EnUs];
            string titleFormat = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.ApprovalTaskTitle, lcid);
            string taskTitle = string.Format(titleFormat, processTitle);
            Dictionary<string, dynamic> keyValuePairs = new Dictionary<string, object>();
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Title, taskTitle);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_StartDate, DateTime.Now);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_DueDate, workflow.DueDate.Value.LocalDateTime);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To, approverUser.Id);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.ContentTypeId, OPMConstants.OPMContentTypeId.CTApprovalTaskStringId);
            List taskList = await SharePointListService.GetListByUrlAsync(appContext, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskListItem = await SharePointListService.AddListItemAsync(appContext, taskList, keyValuePairs);

            var addedWorkflow = await WorkflowService.CreateAsync(workflow);
            var workflowTask = await WorkflowTaskService.CreateAsync(addedWorkflow.Id, request.Approver.Uid, taskListItem.Id);

            await SendForApprovalEmailAsync(request, approverUser, currentUser, processTitle, taskTitle, taskListItem.Id);

        }

        public async ValueTask CancelApprovalTaskAndSendEmailAsync(Workflow workflow, Process process, string webUrl)
        {
            PortableClientContext appContext = SharePointClientContextProvider.CreateClientContext(webUrl, true);
            List taskList = await SharePointListService.GetListByUrlAsync(appContext, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskListItem = taskList.GetItemById(workflow.WorkflowTasks.FirstOrDefault().SPTaskId);
            taskListItem[OPMConstants.SharePoint.SharePointFields.Fields_Status] = Models.Workflows.TaskStatus.Cancel.ToString();
            taskListItem[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete] = 1;
            taskListItem.Update();
            await appContext.ExecuteQueryAsync();

            await SendCancellWorkflowEmail(workflow, process);
            await WorkflowService.CompleteAsync(workflow.Id, WorkflowCompletedType.Cancelled);
        }

        public async ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask, string webUrl)
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
        }

        public async ValueTask CompletedApprovalTaskAndSendEmail(WorkflowApprovalTask approvalTask, string webUrl)
        {
            await WorkflowService.CompleteAsync(approvalTask.Workflow.Id, WorkflowCompletedType.AllTasksDone);
            await WorkflowTaskService.CompletedTask(approvalTask.Id, approvalTask.Comment, approvalTask.TaskOutcome);
            await SendCompletedEmailAsync(approvalTask);
        }

        #region Utils
        private async ValueTask SendForApprovalEmailAsync(PublishProcessWithApprovalRequest request, User approverUser, Fx.Models.Users.User currentUser, string processTitle, string taskTitle, int taskListItemId)
        {
            if (!string.IsNullOrEmpty(approverUser.Email))
            {
                string taskUrl = string.Format(OPMConstants.OPMPages.ApprovalTaskUrl, request.WebUrl, taskListItemId);
                string emailTemplate = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyLocalizedKey;
                string previewProcessLink = string.Format(OPMConstants.EmailTemplates.LinkHtmlTemplate, string.Format(OPMConstants.OPMPages.ProcessPreviewUrl, request.WebUrl), processTitle);

                if (!string.IsNullOrEmpty(request.Comment))
                {
                    emailTemplate += OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.ApprovalEditionCommentTemplateKey;
                }
                var emailInfo = new EmailInfo();
                emailInfo.Subject = OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectLocalizedKey;
                emailInfo.Body.Add(emailTemplate);

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Name,  processTitle},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Author,  currentUser.DisplayName},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Approver,  approverUser.Title },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.ProcessLink, previewProcessLink },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Message,  request.Comment},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.TaskTitle,  string.Format(OPMConstants.EmailTemplates.LinkHtmlTemplate, taskUrl, taskTitle) }
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.DueDate,  request.DueDate},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.StartDate,  DateTime.Now}
                });
                emailInfo.To = new List<string> { approverUser.Email };
                emailInfo.LocalizationSetting.ApplyUserSetting(approverUser.UserPrincipalName);
                await EmailService.SendEmailAsync(emailInfo);
            }
        }

        private async ValueTask SendCancellWorkflowEmail(Workflow workflow, Process process)
        {
            List<Fx.Models.Users.User> userApprovers = await UserService.GetByPrincipalNamesAsync(workflow.WorkflowTasks.Select(d => d.AssignedUser).ToList());
            foreach (WorkflowTask workflowTask in workflow.WorkflowTasks)
            {
                Fx.Models.Users.User fxUser = userApprovers.FirstOrDefault(r => workflowTask.AssignedUser.ToLower().Equals(r.UserPrincipalName.ToLower()));

                if (!string.IsNullOrEmpty(fxUser.Mail))
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

        private async ValueTask SendCompletedEmailAsync(WorkflowApprovalTask task)
        {
            string emailTemplate = string.Empty;
            string emailTitle = string.Empty;
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

            if (task.Author != null && !string.IsNullOrEmpty(task.Author.Mail))
            {
                var emailInfo = new EmailInfo();
                emailInfo.Subject = emailTitle;
                emailInfo.Body.Add(emailTemplate);
                emailInfo.LocalizationSetting.ApplyUserSetting(task.Author.UserPrincipalName);

                emailInfo.UseMultilingualTokenInfo(OmniaScopedContext.BusinessProfileId)
                   .AddTokenMultilingualValues(new Dictionary<string, MultilingualString>
                   {
                        {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Name, task.Process.RootProcessStep.Title }
                   });

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Author,  task.Author.DisplayName},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Approver,  task.AssignedTo.DisplayName },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.ApproverComment,  task.Comment }
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.DueDate,  task.Workflow.DueDate.Value},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.StartDate, task.Workflow.CreatedAt}
                });

                emailInfo.To = new List<string> { task.Author.Mail };
                await EmailService.SendEmailAsync(emailInfo);
            }
        }
        #endregion
    }
}
