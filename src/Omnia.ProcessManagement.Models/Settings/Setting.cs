using Newtonsoft.Json;
using Omnia.Fx;
using Omnia.Fx.Models.JsonTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Models.Settings
{
    public class Setting : OmniaJsonBase
    {
        private bool _cleanModel;
        public Setting()
        {
            Key = "globalsettings";
            SecurityRoleId = new Guid(Constants.Security.Roles.TenantAdmin);
            _cleanModel = true;
        }

        public string Key { get; set; }

        [JsonIgnore]
        public Guid SecurityRoleId { get; }

        public string ArchiveSiteUrl { get; set; }

        public void CleanModelIfNeeded()
        {
            if (_cleanModel && AdditionalProperties != null)
            {
                AdditionalProperties.Clear();
            }
        }

        public virtual ValueTask ValidateAsync()
        {
            return new ValueTask();
        }
    }
}
