using Omnia.ProcessManagement.Models.Processes;
using System;

namespace Omnia.ProcessManagement.Core.InternalModels.Processes
{
    internal class InternalProcess : Process
    {
        /// <summary>
        /// For internal process, we don't need to load the unnecessary data to boot the performance
        /// </summary>
        [Obsolete("Don't use this", true)]
        public new RootProcessStep RootProcessStep { get; set; }
        [Obsolete("Don't use this", true)]
        public new string CreatedBy { get; set; }
        [Obsolete("Don't use this", true)]
        public new string ModifiedBy { get; set; }
        [Obsolete("Don't use this", true)]
        public new DateTimeOffset CreatedAt { get; set; }
        [Obsolete("Don't use this", true)]
        public new DateTimeOffset ModifiedAt { get; set; }
    }
}
