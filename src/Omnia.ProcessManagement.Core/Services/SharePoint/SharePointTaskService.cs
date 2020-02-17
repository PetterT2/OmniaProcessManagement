using Microsoft.SharePoint.Client;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Models.Language;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.ProcessManagement.Core.Services.Graph;
using Omnia.ProcessManagement.Core.Services.SharePoint.Helpers;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Graph;
using Omnia.ProcessManagement.Models.SharePointTasks;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    internal class SharePointTaskService : ISharePointTaskService
    {
        ISharePointListService SharePointListService { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        IGraphService GraphService { get; }
        public SharePointTaskService(ISharePointClientContextProvider sharePointClientContextProvider,
            ISharePointListService sharePointListService,
            IGraphService graphService)
        {
            SharePointClientContextProvider = sharePointClientContextProvider;
            SharePointListService = sharePointListService;
            GraphService = graphService;
        }

        public async ValueTask<GraphSharePointTaskResponse> GetTasksByGraphApiAsync(SharePointTaskRequest taskRequest)
        {
            var result = new GraphSharePointTaskResponse();
            Uri webUri = new Uri(taskRequest.WebUrl);
            string authorityUrl = webUri.GetLeftPart(UriPartial.Authority);
            string relativeUrl = new Uri(authorityUrl).MakeRelativeUri(webUri).OriginalString;
            string hostName = webUri.Host;
            var site = await GraphService.GetSiteAsync(hostName, relativeUrl);
            string siteId = site != null ? site.Id : null;
            if (siteId == null) return null;
            PortableClientContext userContext = SharePointClientContextProvider.CreateClientContext(taskRequest.WebUrl);
            User spCurrentUser = null;
            spCurrentUser = userContext.Web.CurrentUser;
            userContext.Load(spCurrentUser, p => p.Id);
            await userContext.ExecuteQueryAsync();

            var taskList = await GraphService.GetListByWebUrlAsync(siteId, taskRequest.WebUrl + '/' + OPMConstants.SharePoint.ListUrl.TaskList);
            if (taskList == null) return null;

            GraphApiGetListItemsResponse tasksResponse = null;
            if (string.IsNullOrEmpty(taskRequest.PagingInfo))
            {
                string[] viewFields = GetViewFields();

                List<string> filterQueries = new List<string>();
                if (taskRequest.SPItemId > 0)
                {
                    filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterEqualByField(
                        OPMConstants.SharePoint.SharePointFields.Fields_ID, taskRequest.SPItemId.ToString()));
                }
                switch (taskRequest.ViewMode)
                {
                    case TaskViewType.AssignedToMe:
                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterNotEqualByField(
                            OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.TaskStatus.Cancel));
                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterNotEqualByField(
                            OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.TaskStatus.Completed));

                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterEqualByField(
                            OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To_LookupId, spCurrentUser.Id.ToString()));

                        break;
                    case TaskViewType.CompletedTasks:
                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterEqualByField(
                            OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.TaskStatus.Completed));

                        break;
                    case TaskViewType.AssignedByMe:
                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterNotEqualByField(
                           OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.TaskStatus.Cancel));
                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterNotEqualByField(
                            OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.TaskStatus.Completed));
                        filterQueries.Add(OPMUtilities.GenerateGraphApiQueryFilterEqualByField(
                         OPMConstants.SharePoint.SharePointFields.Fields_Author_LookupId, spCurrentUser.Id.ToString()));

                        break;
                }
                string filterQuery = OPMUtilities.GenerateGraphApiQueryAndJoinFilter(filterQueries);

                string orderByQuery = "";
                if (!string.IsNullOrEmpty(taskRequest.SortBy))
                {
                    orderByQuery = OPMUtilities.GenerateGraphApiOrderBy(taskRequest.SortBy, taskRequest.SortAsc);
                }

                tasksResponse = await GraphService.GetListItemsAsync(siteId, taskList.Id, new List<string>(viewFields),
                    filterQuery, orderByQuery, taskRequest.RowPerPage);
            }
            else
                tasksResponse = await GraphService.GetListItemsAsync(taskRequest.PagingInfo);

            if (tasksResponse == null)
                return result;
            result.NextLinkUrl = tasksResponse.NextLinkUrl;

            foreach (var item in tasksResponse.ListItems)
            {
                SharePointTask task = ParseToSharePointTask(item, taskList.Id, spCurrentUser.Id, taskRequest.WebUrl);
                task.Created = item.CreatedDateTime;
                task.CreatedBy = item.CreatedBy != null ? item.CreatedBy.DisplayName : "";
                result.Tasks.Add(task);
            }

            return result;
        }

        public async ValueTask<SharePointTask> GetTaskByIdAsync(string spUrl, int id)
        {
            PortableClientContext ctx = SharePointClientContextProvider.CreateClientContext(spUrl);
            ctx.Load(ctx.Web, w => w.Title, w => w.Url, w => w.ServerRelativeUrl);
            ctx.Load(ctx.Web.CurrentUser, p => p.LoginName, p => p.Email, p => p.Title, p => p.Id);
            List taskList = await SharePointListService.GetListByUrlAsync(ctx, OPMConstants.SharePoint.ListUrl.TaskList, false);
            var taskItem = taskList.GetItemById(id);
            ctx.Load(taskItem);
            await ctx.ExecuteQueryAsync();

            var sharePointTask = ParseToSharePointTask(taskList.Id, taskItem, ctx.Web.CurrentUser.Id, ctx.Web.Url);

            return sharePointTask;
        }

        public async ValueTask<CSOMSharePointTaskResponse> GetTasksByCSOMAsync(SharePointTaskRequest request)
        {
            CSOMSharePointTaskResponse response = new CSOMSharePointTaskResponse();
            PortableClientContext userContext = SharePointClientContextProvider.CreateClientContext(request.WebUrl);
            userContext.Load(userContext.Web, w => w.Title, w => w.Url, w => w.ServerRelativeUrl);
            userContext.Load(userContext.Web.CurrentUser, p => p.LoginName, p => p.Email, p => p.Title, p => p.Id);
            await userContext.ExecuteQueryAsync();
            List ctxTaskList = await SharePointListService.GetListByUrlAsync(userContext, OPMConstants.SharePoint.ListUrl.TaskList, true);
            if (ctxTaskList == null) return response;
            StringBuilder queryParams = BuildCAMLByTaskRequest(userContext.Web.CurrentUser, request);
            string nextPageString = string.Empty;
            string previousPageString = string.Empty;
            List<SharePointTask> tasks = new List<SharePointTask>();

            var listItems = await SharePointListService.GetListItemsAsync(userContext, ctxTaskList, queryParams.ToString(),
                OPMConstants.SharePoint.SharePointFields.Fields_Title + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_Author + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_Editor + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_StartDate + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_DueDate + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_Status + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_Predecessors + ";" +
                OPMConstants.SharePoint.SharePointFields.Fields_TaskDescription + ";" +
                OPMConstants.SharePoint.SharePointFields.ContentTypeId + ";" +
                OPMConstants.SharePoint.OPMFields.Fields_ProcessId + ";" +
                OPMConstants.SharePoint.OPMFields.Fields_Comment,
                OPMConstants.SharePoint.CamlQueryString.ScopeRecursive, request.PagingInfo, request.SortBy, request.SortAsc, request.RowPerPage);

            if (listItems.Count > 0)
            {
                var itemPosition = listItems.ListItemCollectionPosition;

                nextPageString = null != itemPosition ? itemPosition.PagingInfo : string.Empty;

                if (request.CurrentPage > 0)
                {
                    DateTime date;
                    if (!string.IsNullOrEmpty(request.SortBy) && DateTime.TryParse(listItems[0][request.SortBy].ToString(), out date))
                    {
                        previousPageString = string.Format("Paged=TRUE&PagedPrev=TRUE&p_ID={0}&p_{2}={1}", listItems[0].Id, date.ToString("yyyyMMdd hh:mm:ss"), request.SortBy);
                    }
                    else if (!string.IsNullOrEmpty(request.SortBy) && !DateTime.TryParse(listItems[0][request.SortBy].ToString(), out date))
                        previousPageString = string.Format("Paged=TRUE&PagedPrev=TRUE&p_ID={0}&p_{2}={1}", listItems[0].Id, listItems[0][request.SortBy].ToString(), request.SortBy);
                    else
                        previousPageString = string.Format("Paged=TRUE&PagedPrev=TRUE&p_ID={0}&p_FileLeafRef={1}", listItems[0].Id, listItems[0][OPMConstants.SharePoint.SharePointFields.Fields_FileLeafRef].ToString());

                }
                if (request.CurrentPage == 1)
                {
                    previousPageString = string.Empty;
                }

                foreach (var item in listItems)
                {
                    tasks.Add(ParseToSharePointTask(ctxTaskList.Id, item, userContext.Web.CurrentUser.Id, userContext.Web.Url));
                }
            }
            response.Tasks = tasks;
            response.PreviousPageString = previousPageString;
            response.NextPageString = nextPageString;
            return response;
        }

        private StringBuilder BuildCAMLByTaskRequest(User currentUser, SharePointTaskRequest request)
        {
            try
            {
                var queryParams = new StringBuilder();
                switch (request.ViewMode)
                {
                    case TaskViewType.AssignedToMe:
                        SharePointCamlHelper.AppendParam(queryParams, "Neq", OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.SharepointType.Text, OPMConstants.SharePoint.TaskStatus.Cancel);
                        SharePointCamlHelper.AppendParam(queryParams, "Neq", OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.SharepointType.Text, OPMConstants.SharePoint.TaskStatus.Completed);
                        queryParams.Insert(0, "<And>");
                        queryParams.Append("</And>");
                        SharePointCamlHelper.AppendParam(queryParams, "Eq", OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To, OPMConstants.SharePoint.SharepointType.UserId, currentUser.Id.ToString());
                        queryParams.Insert(0, "<And>");
                        queryParams.Append("</And>");
                        break;
                    case TaskViewType.CompletedTasks:
                        SharePointCamlHelper.AppendParam(queryParams, "Eq", OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.SharepointType.Text, OPMConstants.SharePoint.TaskStatus.Completed);
                        break;
                    case TaskViewType.AssignedByMe:
                        SharePointCamlHelper.AppendParam(queryParams, "Neq", OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.SharepointType.Text, OPMConstants.SharePoint.TaskStatus.Cancel);
                        SharePointCamlHelper.AppendParam(queryParams, "Neq", OPMConstants.SharePoint.SharePointFields.Fields_Status, OPMConstants.SharePoint.SharepointType.Text, OPMConstants.SharePoint.TaskStatus.Completed);
                        queryParams.Insert(0, "<And>");
                        queryParams.Append("</And>");
                        SharePointCamlHelper.AppendParam(queryParams, "Eq", OPMConstants.SharePoint.SharePointFields.Fields_Author, OPMConstants.SharePoint.SharepointType.UserId, currentUser.Id.ToString());
                        queryParams.Insert(0, "<And>");
                        queryParams.Append("</And>");
                        break;
                }

                queryParams.Insert(0, "<Where>");
                queryParams.Append("</Where>");

                return queryParams;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private SharePointTask ParseToSharePointTask(Guid listId, ListItem item, int currentUserId, string webUrl)
        {
            string assignedTo = string.Empty;
            int assignedToLookupId = 0;
            if (item[OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To] != null)
            {
                FieldUserValue userValue = (item[OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To] as FieldUserValue);
                assignedTo = userValue.LookupValue;
                assignedToLookupId = userValue.LookupId;
            }

            string contentType = item[OPMConstants.SharePoint.SharePointFields.ContentTypeId] != null ? item[OPMConstants.SharePoint.SharePointFields.ContentTypeId].ToString() : string.Empty;
            TaskContentType taskContentType = contentType.StartsWith(OPMConstants.OPMContentTypeId.CTApprovalTaskStringId) ? TaskContentType.ApprovalTask : TaskContentType.Undefined;

            var spTask = new SharePointTask
            {
                Id = item.Id,
                ListId = listId,
                AssignedTo = assignedTo,
                Description = item[OPMConstants.SharePoint.SharePointFields.Fields_TaskDescription] != null ? item[OPMConstants.SharePoint.SharePointFields.Fields_TaskDescription].ToString() : string.Empty,
                Title = item[OPMConstants.SharePoint.SharePointFields.Fields_Title] != null ? item[OPMConstants.SharePoint.SharePointFields.Fields_Title].ToString() : string.Empty,
                PercentComplete = item[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete] != null ? double.Parse(item[OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete].ToString()) : 0,
                Status = item[OPMConstants.SharePoint.SharePointFields.Fields_Status] != null ? item[OPMConstants.SharePoint.SharePointFields.Fields_Status].ToString() : string.Empty,
                Comment = item[OPMConstants.SharePoint.OPMFields.Fields_Comment] != null ? item[OPMConstants.SharePoint.OPMFields.Fields_Comment].ToString() : string.Empty,
                OPMProcessId = item[OPMConstants.SharePoint.OPMFields.Fields_ProcessId] != null ? Guid.Parse(item[OPMConstants.SharePoint.OPMFields.Fields_Comment].ToString()) : Guid.Empty,
                ContentType = taskContentType,
                WebUrl = webUrl,
                IsCurrentResponsible = currentUserId == assignedToLookupId
            };

            if (item[OPMConstants.SharePoint.SharePointFields.Fields_StartDate] != null) spTask.StartDate = Convert.ToDateTime(item[OPMConstants.SharePoint.SharePointFields.Fields_StartDate].ToString());
            if (item[OPMConstants.SharePoint.SharePointFields.Fields_DueDate] != null) spTask.DueDate = Convert.ToDateTime(item[OPMConstants.SharePoint.SharePointFields.Fields_DueDate].ToString()).ToLocalTime();

            return spTask;
        }


        private SharePointTask ParseToSharePointTask(GraphApiSPListItem item, Guid listId, int userId, string webUrl)
        {
            try
            {
                string assignedTo = "";
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To, out var assignedToObj);
                if (assignedToObj != null) assignedTo = assignedToObj.ToString();

                int assignedToLookupId = 0;
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To_LookupId, out var assignedToLookupIdObj);
                if (assignedToLookupIdObj != null) int.TryParse(assignedToLookupIdObj.ToString(), out assignedToLookupId);

                string title = "";
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_Title, out var titleObj);
                if (titleObj != null) title = titleObj.ToString();

                string comment = "";
                item.Fields.TryGetValue(OPMConstants.SharePoint.OPMFields.Fields_Comment, out var commentObj);
                if (commentObj != null) comment = commentObj.ToString();

                string description = "";
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_TaskDescription, out var descriptionObj);
                if (descriptionObj != null) description = descriptionObj.ToString();

                string status = "";
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_Status, out var statusObj);
                if (statusObj != null) status = statusObj.ToString();

                double percentComplete = 0;
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete, out var percentCompleteObj);
                if (percentCompleteObj != null) double.TryParse(percentCompleteObj.ToString(), out percentComplete);

                Guid opmProcessId = Guid.Empty;
                item.Fields.TryGetValue(OPMConstants.SharePoint.OPMFields.Fields_ProcessId, out var opmProcessIdObj);
                if (opmProcessIdObj != null) Guid.TryParse(opmProcessIdObj.ToString(), out opmProcessId);

                string contentType = "";
                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.ContentTypeId, out var contentTypeObj);
                if (contentTypeObj != null) contentType = JObject.Parse(contentTypeObj.ToString())["StringValue"].ToString();
                TaskContentType taskContentType = contentType.StartsWith(OPMConstants.OPMContentTypeId.CTApprovalTaskStringId) ?
                    TaskContentType.ApprovalTask : TaskContentType.Undefined; //TODO

                SharePointTask task = new SharePointTask
                {
                    Id = item.Id,
                    Title = title,
                    ListId = listId,
                    AssignedTo = assignedTo,
                    ContentType = taskContentType,
                    Status = status,
                    PercentComplete = percentComplete,
                    Comment = comment,
                    Description = description,
                    WebUrl = webUrl,
                    OPMProcessId = opmProcessId,
                    IsCurrentResponsible = userId == assignedToLookupId
                };

                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_StartDate, out var startDateObj);
                if (startDateObj != null)
                {
                    DateTime startDate = DateTime.MinValue;
                    DateTime.TryParse(startDateObj.ToString(), out startDate);
                    task.StartDate = startDate;
                }

                item.Fields.TryGetValue(OPMConstants.SharePoint.SharePointFields.Fields_DueDate, out var dueDateObj);
                if (dueDateObj != null)
                {
                    DateTime dueDate = DateTime.MinValue;
                    DateTime.TryParse(dueDateObj.ToString(), out dueDate);
                    task.DueDate = dueDate;
                }

                return task;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private string[] GetViewFields()
        {
            string[] viewFields = {
                OPMConstants.SharePoint.SharePointFields.Fields_ID + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Title + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Author + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Author_LookupId + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Editor + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Assigned_To_LookupId + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_PercentComplete + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_StartDate + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_DueDate + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Status + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_Predecessors + "," +
                OPMConstants.SharePoint.SharePointFields.Fields_TaskDescription + "," +
                OPMConstants.SharePoint.OPMFields.Fields_ProcessId + "," +
                OPMConstants.SharePoint.OPMFields.Fields_Comment + "," +
                OPMConstants.SharePoint.SharePointFields.ContentTypeId
            };
            return viewFields;
        }
    }
}