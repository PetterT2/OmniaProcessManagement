using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Enums
{
    public enum ProcessVersionType : byte
    {
        Draft = 0,
        CheckedOut = 1,
        Archived = 2,
        Published = 3
    }

    public enum DraftOrPublishedVersionType
    {
        Draft = ProcessVersionType.Draft,
        Published = ProcessVersionType.Published,
        CheckedOut = ProcessVersionType.CheckedOut
    }
}
