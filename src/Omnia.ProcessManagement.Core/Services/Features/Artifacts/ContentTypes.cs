using Omnia.Fx.SharePoint.ContentTypes.Attributes;
using BuiltInContentTypes = Omnia.Fx.SharePoint.ContentTypes.BuiltIn;
using System;
using System.Collections.Generic;
using System.Text;
using Omnia.Fx.SharePoint.Fields.Attributes;
using Omnia.Fx.SharePoint.Fields.BuiltIn;

namespace Omnia.ProcessManagement.Core.Services.Features.Artifacts
{
    [ContentType(id: "BB50337A-A66E-4814-8E62-B830744AA4C4", name: "$Localize:OPM.Core.Features.ContentTypes.OPMReviewTask.Name;",
    Group = "$Localize:OPM.Core.Features.ContentTypes.GroupName;", Description = "$Localize:OPM.Core.Features.ContentTypes.OPMReviewTask.Description;")]
    public class OPMReviewTask : BuiltInContentTypes.Item
    {
        [FieldRef(typeof(StartDate))]
        public string StartDate { get; set; }

        [FieldRef(typeof(TaskDueDate))]
        public string TaskDueDate { get; set; }

        [FieldRef(typeof(AssignedTo))]
        public string AssignedTo { get; set; }

        [FieldRef(typeof(PercentComplete))]
        public string PercentComplete { get; set; }

        [FieldRef(typeof(Body))]
        public string Body { get; set; }

        [FieldRef(typeof(Predecessors))]
        public string Predecessors { get; set; }

        [FieldRef(typeof(Priority))]
        public string Priority { get; set; }

        [FieldRef(typeof(TaskStatus))]
        public string TaskStatus { get; set; }

        [FieldRef(typeof(RelatedItems))]
        public string RelatedItems { get; set; }

        [FieldRef(typeof(OPMComment))]
        public string OPMComment { get; set; }
    }

    [ContentType(id: "3E413201-63EA-4E60-BB6D-88A7A7F69E9F", name: "$Localize:OPM.Core.Features.ContentTypes.OPMApprovalTask.Name;",
        Group = "$Localize:OPM.Core.Features.ContentTypes.GroupName;", Description = "$Localize:OPM.Core.Features.ContentTypes.OPMApprovalTask.Description;")]
    public class OPMApprovalTask : BuiltInContentTypes.Item
    {
        [FieldRef(typeof(StartDate))]
        public string StartDate { get; set; }

        [FieldRef(typeof(TaskDueDate))]
        public string TaskDueDate { get; set; }

        [FieldRef(typeof(AssignedTo))]
        public string AssignedTo { get; set; }

        [FieldRef(typeof(PercentComplete))]
        public string PercentComplete { get; set; }

        [FieldRef(typeof(Body))]
        public string Body { get; set; }

        [FieldRef(typeof(Predecessors))]
        public string Predecessors { get; set; }

        [FieldRef(typeof(Priority))]
        public string Priority { get; set; }

        [FieldRef(typeof(TaskStatus))]
        public string TaskStatus { get; set; }

        [FieldRef(typeof(RelatedItems))]
        public string RelatedItems { get; set; }

        [FieldRef(typeof(OPMComment))]
        public string OPMComment { get; set; }

        [FieldRef(typeof(OPMTaskOutcome))]
        public string OPMTaskOutcome { get; set; }
    }
   
}
