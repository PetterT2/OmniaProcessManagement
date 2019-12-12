using Omnia.Fx.SharePoint.ContentTypes.Attributes;
using BuiltInContentTypes = Omnia.Fx.SharePoint.ContentTypes.BuiltIn;
using System;
using System.Collections.Generic;
using System.Text;
using Omnia.Fx.SharePoint.Fields.Attributes;
using Omnia.Fx.SharePoint.Fields.BuiltIn;

namespace Omnia.ProcessManagement.Core.Services.Features.Artifacts
{   
    [ContentType(id: "48629609-aa6e-4577-b841-268aa6afda0f", name: "$Localize:OPM.Core.Features.ContentTypes.OPMApprovalTask.Name;",
        Group = "$Localize:OPM.Core.Features.ContentTypes.GroupName;", Description = "$Localize:OPM.Core.Features.ContentTypes.OPMApprovalTask.Description;")]
    public class OPMApprovalTask : BuiltInContentTypes.Item
    {
        [FieldRef(typeof(StartDate))]
        [FieldRef(typeof(TaskDueDate))]
        [FieldRef(typeof(AssignedTo))]
        [FieldRef(typeof(PercentComplete))]
        [FieldRef(typeof(Body))]
        [FieldRef(typeof(Predecessors))]
        [FieldRef(typeof(Priority))]
        [FieldRef(typeof(TaskStatus))]
        [FieldRef(typeof(RelatedItems))]
        [FieldRef(typeof(OPMComment))]
        [FieldRef(typeof(OPMTaskOutcome))]
        public IList<string> Fields { get; set; }
    }
   
}
