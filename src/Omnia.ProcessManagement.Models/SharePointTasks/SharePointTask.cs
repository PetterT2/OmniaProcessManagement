using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.SharePointTasks
{
   
    public class SharePointTask
    {
        public SharePointTask()
        { }

        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public string AssignedTo { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? Created { get; set; }
        public Guid ListId { get; set; }
        public TaskContentType ContentType { get; set; }
        public string Status { get; set; }
        public double PercentComplete { get; set; }
        public List<int> PredecessorsId { get; set; }
        public string Comment { get; set; }
        public bool IsCurrentResponsible { get; set; }
        public string Description { get; set; }
        public string WebUrl { get; set; }
        public Guid OPMProcessId { get; set; }
    }
}
