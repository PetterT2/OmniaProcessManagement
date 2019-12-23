using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Processes;
using System;

namespace Omnia.ProcessManagement.Core.InternalModels.Processes
{
    internal class InternalProcessData : ProcessData
    {
        public InternalProcessData(ProcessData processData)
        {
            CanvasDefinition = processData.CanvasDefinition;
            Documents = processData.Documents;
            Content = processData.Content;
            Links = processData.Links;
            Tasks = processData.Tasks;
        }
        /// <summary>
        /// For internal process data, we don't need unnecessary data to boot the performance and save less data
        /// </summary>
        [Obsolete("Don't use this", true)]
        [JsonIgnore]
        public override string CreatedBy { get; set; }

        [Obsolete("Don't use this", true)]
        [JsonIgnore]
        public override string ModifiedBy { get; set; }

        [Obsolete("Don't use this", true)]
        [JsonIgnore]
        public override DateTimeOffset CreatedAt { get; set; }

        [Obsolete("Don't use this", true)]
        [JsonIgnore]
        public override DateTimeOffset ModifiedAt { get; set; }
    }
}
