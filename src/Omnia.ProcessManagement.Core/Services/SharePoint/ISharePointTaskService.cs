using Omnia.ProcessManagement.Models.SharePointTasks;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    public interface ISharePointTaskService
    {
        ValueTask<GraphSharePointTaskResponse> GetTasksByGraphApiAsync(SharePointTaskRequest taskRequest);
        ValueTask<CSOMSharePointTaskResponse> GetTasksByCSOMAsync(SharePointTaskRequest request);
        ValueTask<SharePointTask> GetTaskByIdAsync(string spUrl, int id);
    }
}
