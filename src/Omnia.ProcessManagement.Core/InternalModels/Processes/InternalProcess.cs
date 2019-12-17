using Omnia.ProcessManagement.Models.Processes;
using System;

namespace Omnia.ProcessManagement.Core.InternalModels.Processes
{
    internal class InternalProcess : Process
    {
        /// <summary>
        /// For internal process, we don't need to load the root proces step to boot the performance
        /// </summary>
        [Obsolete("Don't use this", true)]
        public new RootProcessStep RootProcessStep { get; set; }
    }
}
