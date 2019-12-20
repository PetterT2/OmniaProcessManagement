using Omnia.Fx;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Settings
{
    public class SiteGroupIdSettings : DynamicKeySetting
    {
        public int DefaultReaderGroupId { get; set; }
        public int AuthorGroupId { get; set; }

        public SiteGroupIdSettings(string teamAppId) : base(teamAppId, "sitegroupidssettings", new Guid(Constants.Security.Roles.TenantAdmin), true)
        {
        }
    }
}
