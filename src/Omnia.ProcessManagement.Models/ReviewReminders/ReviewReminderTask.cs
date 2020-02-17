using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.SharePointTasks;

namespace Omnia.ProcessManagement.Models.ReviewReminders
{
    public class ReviewReminderTask
    {
        public Process PublishedProcess { get; set; }
        public bool DraftExists { get; set; }
        public bool HasAuthorPermission { get; set; }
        public SharePointTask SharePointTask { get; set; }
    }
}
