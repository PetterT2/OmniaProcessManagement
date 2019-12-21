using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Enums
{
    public enum WorkflowType : byte
    {
        Review = 1,
        Approval = 2,
        CreateDraft = 3,
        MoveProcess = 4
    }
}
