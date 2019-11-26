using Omnia.Fx.Models.JsonTypes;
using Omnia.Fx.Models.Language;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes
{
    public enum ProcessTypeSettingsTypes
    {
        Group = 0,
        Item = 1
    }

    public class ProcessType
    {
        public ProcessType()
        {
            Id = Guid.NewGuid();
        }

        /// <summary>
        /// This is also term id or term set id
        /// </summary>
        public Guid Id { get; set; }

        public Guid RootId { get; set; }

        public int ChildCount { get; set; }

        public MultilingualString Title { get; set; }

        public ProcessTypeSettings Settings { get; set; }

        /// <summary>
        /// This is for secondary-order purpose
        /// </summary>
        public long SecondaryOrderNumber { get; set; }
    }

    public class ProcessTypeSettings : OmniaJsonBase
    {
        public virtual ProcessTypeSettingsTypes Type { get; set; }
        public Guid TermSetId { get; set; }
    }
}
