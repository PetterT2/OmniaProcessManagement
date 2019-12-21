using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Enums
{
    public enum WorkflowCompletedType : byte
    {
        None = 0,
        AllTasksDone = 1,
        MeetDueDate = 2,
        Cancelled = 3
    }

}
