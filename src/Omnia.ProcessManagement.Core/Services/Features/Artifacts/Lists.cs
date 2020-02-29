using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.ContentTypes;
using Omnia.Fx.SharePoint.ContentTypes.Attributes;
using Omnia.Fx.SharePoint.Fields;
using Omnia.Fx.SharePoint.Fields.Attributes;
using Omnia.Fx.SharePoint.Lists;
using Omnia.Fx.SharePoint.Lists.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.Features.Artifacts
{
    [SPList(relativeUrl: OPMConstants.SharePoint.ListUrl.TaskList, Title = "$Localize:OPM.Core.Features.Lists.OPMTasks.Name;",
               ListTemplate = ListTemplateType.Tasks,
               Description = "$Localize:OPM.Core.Features.Lists.OPMTasks.Description;")]
    public class OPMTasks : ListBase, IListBase
    {
        [ContentTypeRef(typeof(OPMApprovalTask))]
        [ContentTypeRef(typeof(OPMReviewReminderTask))]
        public IEnumerable<ContentTypeBase> ContentTypes
        {
            get;
        }

        public IEnumerable<FieldBase> Fields
        {
            get;
        }

        public IEnumerable<FieldBase> DefaultView
        {
            get { return new List<FieldBase>(); }
        }
    }

    [SPList(relativeUrl: OPMConstants.SharePoint.ListUrl.PublishList, Title = "$Localize:OPM.Core.Features.Lists.OPMPublished.Name;",
           ListTemplate = ListTemplateType.DocumentLibrary,
           Description = "$Localize:OPM.Core.Features.Lists.OPMPublished.Description;",
           EnableVersioning = false, EnableMinorVersions = false)]
    public class OPMPublished : ListBase, IListBase
    {
        public IEnumerable<ContentTypeBase> ContentTypes
        {
            get;
        }

        [FieldRef(typeof(OPMIsArchived))]
        [FieldRef(typeof(OPMProcessIdNumber))]
        [FieldRef(typeof(OPMProcessId))]
        [FieldRef(typeof(OPMEdition))]
        [FieldRef(typeof(OPMRevision))]
        [FieldRef(typeof(OPMReviewDate))]
        [FieldRef(typeof(OPMProcessData))]
        public IEnumerable<FieldBase> Fields
        {
            get;
        }

        public IEnumerable<FieldBase> DefaultView
        {
            get { return new List<FieldBase>(); }
        }
    }

    [SPList(relativeUrl: OPMConstants.SharePoint.ListUrl.ArchivedList, Title = "$Localize:OPM.Core.Features.Lists.OPMArchived.Name;",
           ListTemplate = ListTemplateType.DocumentLibrary,
           Description = "$Localize:OPM.Core.Features.Lists.OPMArchived.Description;",
           EnableVersioning = false, EnableMinorVersions = false)]
    public class OPMArchived : ListBase, IListBase
    {
        public IEnumerable<ContentTypeBase> ContentTypes
        {
            get;
        }

        [FieldRef(typeof(OPMIsArchived))]
        [FieldRef(typeof(OPMProcessIdNumber))]
        [FieldRef(typeof(OPMProcessId))]
        [FieldRef(typeof(OPMEdition))]
        [FieldRef(typeof(OPMRevision))]
        [FieldRef(typeof(OPMProcessData))]
        public IEnumerable<FieldBase> Fields
        {
            get;
        }

        public IEnumerable<FieldBase> DefaultView
        {
            get { return new List<FieldBase>(); }
        }
    }
}
