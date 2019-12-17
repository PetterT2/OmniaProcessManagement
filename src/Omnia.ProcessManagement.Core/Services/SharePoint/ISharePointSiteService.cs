using Microsoft.SharePoint.Client;
using Omnia.Fx.Models.Language;
using Omnia.Fx.SharePoint.Client.Core;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    public interface ISharePointSiteService
    {
        ValueTask<(Guid, Guid)> GetSiteIdentityAsync(string webUrl);
    }
}
