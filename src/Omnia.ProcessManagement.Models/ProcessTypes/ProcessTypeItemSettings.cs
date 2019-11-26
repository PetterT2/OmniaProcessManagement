using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes
{
    public class ProcessTypeItemSettings : ProcessTypeSettings
    {
        public ProcessTypeItemSettings()
        {
            ProcessTemplateIds = new List<Guid>();
        }

        public readonly static Guid ApproverGroupId = new Guid("4c32092d-21ec-4137-a3ed-50bcbf6b0f78");
        public override ProcessTypeSettingsTypes Type
        {
            get
            {
                return ProcessTypeSettingsTypes.Item;
            }
        }
        public Guid EnterprisePropertySetId { get; set; }
        public bool AllowAppendices { get; set; }
        public bool AllowConnectToTemplate { get; set; }
        public bool ReplaceTokenOnPublishing { get; set; }
        public bool AllowRevisions { get; set; }
        public bool AllowBypassApprovalForRevisions { get; set; }
        public List<Guid> ProcessTemplateIds { get; set; }
        public Guid? DefaultProcessTemplateId { get; set; }

        /// <summary>
        /// There is special value for defining approver
        /// <see cref="ApproverGroupId"/>
        /// </summary>
        public List<Guid> FeedbackRecipientsPropertyDefinitionIds { get; set; }

        /// <summary>
        /// null means no Review Reminder setup
        /// </summary>
        public ReviewReminder ReviewReminder { get; set; }

        /// <summary>
        /// null means no Archive setup
        /// </summary>
        public Archive Archive { get; set; }

        /// <summary>
        /// null means no Retention setup
        /// </summary>

        /// <summary>
        /// null means no Approval setup
        /// </summary>
        public PublishingApprovalSettings.PublishingApprovalSettings PublishingApprovalSettings { get; set; }
        public Dictionary<Guid, PropertySetItemSettings.PropertySetItemSettings> PropertySetItemSettings { get; set; }
    }
}
