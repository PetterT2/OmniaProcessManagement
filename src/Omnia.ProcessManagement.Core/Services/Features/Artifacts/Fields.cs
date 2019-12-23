using Omnia.Fx.SharePoint.Fields;
using Omnia.Fx.SharePoint.Fields.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.Features.Artifacts
{
    [TextField(id: "36f2d3a4-0d6d-49ce-8f84-740c9777ba64", internalName: OPMConstants.SharePoint.OPMFields.Fields_ProcessId,
    Title = "$Localize:OPM.Core.Features.Fields.OPMProcessId.Name;", Description = "$Localize:OPM.Core.Features.Fields.OPMProcessId.Description;",
    Group = "$Localize:OPM.Core.Features.Fields.GroupName;", Required = false)]
    public class OPMProcessId : FieldBase
    {
    }


    [NumberField(id: "d5128e77-3056-40a9-94c4-f1251a60690a", internalName: OPMConstants.SharePoint.OPMFields.Fields_Edition,
    Title = "$Localize:OPM.Core.Features.Fields.OPMEdition.Name;", Description = "$Localize:OPM.Core.Features.Fields.OPMEdition.Description;",
    Group = "$Localize:OPM.Core.Features.Fields.GroupName;", Required = false)]
    public class OPMEdition : FieldBase
    {
    }

    [NumberField(id: "59e47e4f-561c-4f97-985f-ec843b0d922b", internalName: OPMConstants.SharePoint.OPMFields.Fields_Revision,
    Title = "$Localize:OPM.Core.Features.Fields.OPMRevision.Name;", Description = "$Localize:OPM.Core.Features.Fields.OPMRevision.Description;",
    Group = "$Localize:OPM.Core.Features.Fields.GroupName;", Required = false)]
    public class OPMRevision : FieldBase
    {
    }

    [NoteField(id: "9d23f99a-207d-47aa-8794-fc7a5b56ddd6", internalName: OPMConstants.SharePoint.OPMFields.Fields_ProcessData,
    Title = "$Localize:OPM.Core.Features.Fields.OPMProcessData.Name;", Description = "$Localize:OPM.Core.Features.Fields.OPMProcessData.Description;",
    Group = "$Localize:OPM.Core.Features.Fields.GroupName;", Required = false,
    UnlimitedLengthInDocumentLibrary = true, Sealed = true, NumberOfLines = 6, RichText = false)]
    public class OPMProcessData : FieldBase
    {
    }

    [NoteField(id: "2f8a46a6-3c87-4c59-9acb-8745e605bd40", internalName: OPMConstants.SharePoint.OPMFields.Fields_Comment,
      Title = "$Localize:OPM.Core.Features.Fields.OPMComment.Name;", Description = "$Localize:OPM.Core.Features.Fields.OPMComment.Description;",
      Group = "$Localize:OPM.Core.Features.Fields.GroupName;", Required = false,
      UnlimitedLengthInDocumentLibrary = true, Sealed = true, NumberOfLines = 6, RichText = false)]
    public class OPMComment : FieldBase
    {
    }

    [TextField(id: "b2e4a835-b44e-45ef-a8e5-f467eeaa8081", internalName: OPMConstants.SharePoint.OPMFields.Fields_TaskOutcome,
    Title = "$Localize:OPM.Core.Features.Fields.OPMTaskOutcome.Name;", Description = "$Localize:OPM.Core.Features.Fields.OPMTaskOutcome.Description;",
    Group = "$Localize:OPM.Core.Features.Fields.GroupName;", Required = false)]
    public class OPMTaskOutcome : FieldBase
    {
    }
}
