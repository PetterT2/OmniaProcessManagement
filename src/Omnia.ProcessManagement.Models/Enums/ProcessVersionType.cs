using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Enums
{
    public enum ProcessVersionType : byte
    {
        Draft = 0,
        CheckedOut = 1,
        Published = 2, // Should be changed to Archived??
        LatestPublished = 3,
        Archived = 4 // Should be removed?
    }

    public enum DraftOrLatestPublishedVersionType
    {
        Draft = ProcessVersionType.Draft,
        LatestPublished = ProcessVersionType.LatestPublished
    }
}
