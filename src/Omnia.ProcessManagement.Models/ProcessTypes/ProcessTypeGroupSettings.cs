using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes
{
    public class ProcessTypeGroupSettings : ProcessTypeSettings
    {
        public override ProcessTypeSettingsTypes Type
        {
            get
            {
                return ProcessTypeSettingsTypes.Group;
            }
        }

        /// <summary>
        /// This is the array of children ids in order,don't need any strictly validation here
        /// The value is just used for sorting the children nodes on client-side
        /// The value will be ensured latest in any time when doing the order action
        /// </summary>
        public List<Guid> ChildrenOrders { get; set; }
    }
}
