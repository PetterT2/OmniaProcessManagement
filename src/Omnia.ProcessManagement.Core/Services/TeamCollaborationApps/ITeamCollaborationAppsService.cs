using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.TeamCollaborationApps
{
    /// <summary>
    /// Since the Omnia fx doesn't support caching so we implement OPM own AppService to have caching
    /// </summary>
    public interface ITeamCollaborationAppsService
    {
        ValueTask<string> GetSharePointSiteUrlAsync(Guid teamAppInstanceId);
    }
}
