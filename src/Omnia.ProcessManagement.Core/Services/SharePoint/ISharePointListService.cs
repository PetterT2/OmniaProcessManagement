using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    public interface ISharePointListService
    {
        ValueTask<ListItem> AddListItemAsync(PortableClientContext context, List list, Dictionary<string, dynamic> keyValuePairs);
        ValueTask<List> GetListByUrlAsync(PortableClientContext context, string listUrl);
    }
}
