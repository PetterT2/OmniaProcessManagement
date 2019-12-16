using Microsoft.SharePoint.Client;
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

        public ApprovalTaskService(ISharePointClientContextProvider sharePointClientContextProvider,
          IWorkflowService workflowService,
          IWorkflowTaskService workflowTaskService,
          ISharePointListService sharePointListService,
          ILocalizationProvider localizationProvider,
          IEmailService emailService,
          IUserService userService)
        {
            WorkflowService = workflowService;
            WorkflowTaskService = workflowTaskService;
            SharePointListService = sharePointListService;
            LocalizationProvider = localizationProvider;
            SharePointClientContextProvider = sharePointClientContextProvider;
            UserService = userService;
            EmailService = emailService;
        }

        public async ValueTask AddApprovalTaskAndSendEmailAsync(PublishProcessWithApprovalRequest request, Process process)
        {
            PortableClientContext userContext = SharePointClientContextProvider.CreateClientContext(request.WebUrl);
            User approverUser = userContext.Web.EnsureUser(request.Approver.Uid);
            Fx.Models.Users.User currentUser = await UserService.GetCurrentUserAsync();
            userContext.Load(approverUser, us => us.Title, us => us.LoginName, us => us.Email, us => us.Id);
            await userContext.ExecuteQueryAsync();
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
                    IsRevisionPublishing = request.IsRevisionPublishing
                }
            };

            var lcid = OPMUtilities.GetLcidFromLanguage(currentUser.PreferredLanguage);
            lcid = lcid == null ? userContext.Web.Language : lcid;
            LanguageTag language = currentUser.PreferredLanguage.HasValue ? currentUser.PreferredLanguage.Value : LanguageTag.EnUs;
            string processTitle = process.RootProcessStep.Title[language] != null ? process.RootProcessStep.Title[language] : process.RootProcessStep.Title[LanguageTag.EnUs];
            string titleFormat = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.ApprovalTaskTitle, lcid != null ? lcid : userContext.Web.Language);
            Dictionary<string, dynamic> keyValuePairs = new Dictionary<string, object>();
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Title, string.Format(titleFormat, processTitle));
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_StartDate, DateTime.Now);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_DueDate, workflow.DueDate.Value.LocalDateTime);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To, approverUser.Id);
            keyValuePairs.Add(OPMConstants.SharePoint.SharePointFields.ContentTypeId, OPMConstants.OPMContentTypeId.CTApprovalTaskStringId);
            List taskList = await SharePointListService.GetListByUrlAsync(userContext, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskListItem = await SharePointListService.AddListItemAsync(userContext, taskList, keyValuePairs);

            var addedWorkflow = await WorkflowService.CreateAsync(workflow);
            var workflowTask = await WorkflowTaskService.CreateAsync(addedWorkflow.Id, request.Approver.Uid, taskListItem.Id);

            await SendForApprovalEmailAsync(request, approverUser, currentUser, processTitle, keyValuePairs, taskListItem.Id, lcid.Value);

        }

        public async ValueTask CancelApprovalTaskAndSendEmailAsync(Workflow workflow, Process process, string webUrl)
        {
            PortableClientContext userContext = SharePointClientContextProvider.CreateClientContext(webUrl);
            List taskList = await SharePointListService.GetListByUrlAsync(userContext, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskListItem = taskList.GetItemById(workflow.WorkflowTasks.FirstOrDefault().SPTaskId);
            userContext.Load(taskListItem);
            await userContext.ExecuteQueryAsync();
            taskListItem[OPMConstants.SharePoint.SharePointFields.Fields_Status] = Models.Workflows.TaskStatus.Cancel.ToString();
            taskListItem[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete] = 1;
            taskListItem.Update();
            await userContext.ExecuteQueryAsync();

            await SendCancellWorkflowEmail(userContext, workflow, process);
            await WorkflowService.CompleteAsync(workflow.Id, WorkflowCompletedType.Cancelled);
        }

        public async ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            PortableClientContext userContext = SharePointClientContextProvider.CreateClientContext(approvalTask.WebUrl);
            List taskList = await SharePointListService.GetListByUrlAsync(userContext, OPMConstants.SharePoint.ListUrl.TaskList);
            ListItem taskItem = taskList.GetItemById(approvalTask.SPTaskId);
            userContext.Load(taskItem,
                it => it.Id,
                it => it[OPMConstants.SharePoint.SharePointFields.Fields_Status],
                it => it[OPMConstants.SharePoint.OPMFields.Fields_Comment],
                it => it[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete],
                it => it[OPMConstants.SharePoint.OPMFields.Fields_TaskOutcome]);
            await userContext.ExecuteQueryAsync();

            string taskOutcomeText = "";
            var currentUser = await UserService.GetCurrentUserAsync();
            var lcid = OPMUtilities.GetLcidFromLanguage(currentUser.PreferredLanguage);
            lcid = lcid == null ? userContext.Web.Language : lcid;
            if (approvalTask.TaskOutcome == TaskOutcome.Approved)
                taskOutcomeText = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ApprovedText, lcid);
            else taskOutcomeText = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.LocalizedTextKeys.ApprovedText, lcid);

            taskItem[OPMConstants.SharePoint.SharePointFields.Fields_Status] = Models.Workflows.TaskStatus.Completed.ToString();
            taskItem[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete] = 1;
            taskItem[OPMConstants.SharePoint.OPMFields.Fields_Comment] = approvalTask.Comment;
            taskItem[OPMConstants.SharePoint.OPMFields.Fields_TaskOutcome] = taskOutcomeText;
            taskItem.Update();
            await userContext.ExecuteQueryAsync();
        }

        public async ValueTask CompletedApprovalTaskAndSendEmail(WorkflowApprovalTask approvalTask)
        {
            await WorkflowService.CompleteAsync(approvalTask.Workflow.Id, WorkflowCompletedType.AllTasksDone);
            await WorkflowTaskService.CompletedTask(approvalTask.Id, approvalTask.Comment, approvalTask.TaskOutcome);
            PortableClientContext userContext = SharePointClientContextProvider.CreateClientContext(approvalTask.WebUrl);
            await SendCompletedEmailAsync(userContext, approvalTask);
        }

        #region Utils
        private async ValueTask SendForApprovalEmailAsync(PublishProcessWithApprovalRequest request, User approverUser, Fx.Models.Users.User currentUser, string processTitle, Dictionary<string, dynamic> keyValuePairs, int taskListItemId, uint lcid)
        {
            if (!string.IsNullOrEmpty(approverUser.Email))
            {
                string taskUrl = string.Format(OPMConstants.OPMPages.ApprovalTaskUrl, request.WebUrl, taskListItemId);
                string emailTemplate = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyLocalizedKey, lcid);
                string previewProcessLink = string.Format(OPMConstants.EmailTemplates.LinkHtmlTemplate, string.Format(OPMConstants.OPMPages.ProcessPreviewUrl, request.WebUrl), processTitle);

                if (!string.IsNullOrEmpty(request.Comment))
                {
                    emailTemplate += await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.ApprovalEditionCommentTemplateKey, lcid);
                }
                var emailInfo = new EmailInfo();
                emailInfo.IsUsingUserPermision = true;
                emailInfo.Subject = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectLocalizedKey, lcid);
                emailInfo.Body.Add(emailTemplate);

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Name,  processTitle},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Author,  currentUser.DisplayName},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Approver,  approverUser.Title },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.ProcessLink, previewProcessLink },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Message,  request.Comment},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.TaskTitle,  string.Format(OPMConstants.EmailTemplates.LinkHtmlTemplate, taskUrl, keyValuePairs[OPMConstants.SharePoint.SharePointFields.Title]) }
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.DueDate,  request.DueDate},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.StartDate,  DateTime.Now}
                });

                emailInfo.To = new List<string> { approverUser.Email };
                emailInfo.LocalizationSetting.ApplyUserSetting(approverUser.Email);
                await EmailService.SendEmailAsync(emailInfo);
            }
        }

        private async ValueTask SendCancellWorkflowEmail(PortableClientContext context, Workflow workflow, Process process)
        {
            var currentUser = await UserService.GetCurrentUserAsync();
            var lcid = OPMUtilities.GetLcidFromLanguage(currentUser.PreferredLanguage);
            lcid = lcid == null ? context.Web.Language : lcid;
            LanguageTag language = currentUser.PreferredLanguage.HasValue ? currentUser.PreferredLanguage.Value : LanguageTag.EnUs;
            string processTitle = process.RootProcessStep.Title[language] != null ? process.RootProcessStep.Title[language] : process.RootProcessStep.Title[LanguageTag.EnUs];

            List<Fx.Models.Users.User> userApprovers = await UserService.GetByPrincipalNamesAsync(workflow.WorkflowTasks.Select(d => d.AssignedUser).ToList());
            foreach (WorkflowTask WorkflowTask in workflow.WorkflowTasks)
            {
                Fx.Models.Users.User fxUser = userApprovers.FirstOrDefault(r => WorkflowTask.AssignedUser.ToLower().Equals(r.UserPrincipalName.ToLower()));

                if (!string.IsNullOrEmpty(fxUser.Mail))
                {
                    var emailInfo = new EmailInfo();
                    emailInfo.IsUsingUserPermision = true;
                    emailInfo.Subject = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.SubjectLocalizedKey, lcid);
                    string emailBody = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.BodyLocalizedKey, lcid);
                    emailInfo.Body.Add(emailBody);

                    emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                            { OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.Tokens.Approver,  string.Join(", ", userApprovers.Select(r => r.DisplayName)) },
                            { OPMConstants.EmailTemplates.CancelApprovalEmailTemplate.Tokens.Name,  processTitle }
                        });

                    emailInfo.To = new List<string> { fxUser.Mail };
                    emailInfo.LocalizationSetting.ApplyUserSetting(fxUser.Mail);
                    await EmailService.SendEmailAsync(emailInfo);
                }
            }
        }

        private async ValueTask SendCompletedEmailAsync(PortableClientContext context, WorkflowApprovalTask task)
        {
            var currentUser = await UserService.GetCurrentUserAsync();
            var lcid = OPMUtilities.GetLcidFromLanguage(currentUser.PreferredLanguage);
            lcid = lcid == null ? context.Web.Language : lcid;
            LanguageTag language = currentUser.PreferredLanguage.HasValue ? currentUser.PreferredLanguage.Value : LanguageTag.EnUs;
            string processTitle = task.Process.RootProcessStep.Title[language] != null ? task.Process.RootProcessStep.Title[language] : task.Process.RootProcessStep.Title[LanguageTag.EnUs];
            string emailTemplate = string.Empty;
            string emailTitle = string.Empty;
            if (task.TaskOutcome == TaskOutcome.Approved)
            {
                if (!string.IsNullOrEmpty(task.Comment))
                {
                    emailTemplate = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyApprovalKey, lcid);
                }
                else
                {
                    emailTemplate = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyApprovalNoCommentKey, lcid);
                }
                emailTitle = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectApprovalKey, lcid);
            }
            else
            {
                emailTemplate = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.BodyRejectKey, lcid);
                emailTitle = await LocalizationProvider.GetLocalizedValueAsync(OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.SubjectRejectKey, lcid);
            }

            if (task.Author != null && !string.IsNullOrEmpty(task.Author.Mail))
            {
                var emailInfo = new EmailInfo();
                emailInfo.IsUsingUserPermision = true;
                emailInfo.Subject = emailTitle;
                emailInfo.Body.Add(emailTemplate);

                emailInfo.TokenInfo.AddTokenValues(new System.Collections.Specialized.NameValueCollection {
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Name, processTitle },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Author,  task.Author.DisplayName},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.Approver,  task.AssignedTo.DisplayName },
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.ApproverComment,  task.Comment }
                });

                emailInfo.TokenInfo.AddTokenDatetimeValues(new Dictionary<string, DateTimeOffset>{
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.DueDate,  task.Workflow.DueDate.Value},
                    {OPMConstants.EmailTemplates.SendForApprovalEmailTemplate.Tokens.StartDate, task.Workflow.CreatedAt}
                });

                emailInfo.To = new List<string> { task.Author.Mail };
                emailInfo.LocalizationSetting.ApplyUserSetting(task.Author.Mail);
                await EmailService.SendEmailAsync(emailInfo);
            }
        }
        #endregion
    }
}
