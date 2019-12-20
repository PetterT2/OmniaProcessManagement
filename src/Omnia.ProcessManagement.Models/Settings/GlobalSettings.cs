using Omnia.Fx;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Models.Settings
{
    public class GlobalSettings : Setting
    {
        public GlobalSettings() : base("globalsettings", new Guid(Constants.Security.Roles.TenantAdmin), true) { }

        public string ArchiveSiteUrl { get; set; }

        public override ValueTask ValidateAsync()
        {
            return new ValueTask();
        }
    }
}
