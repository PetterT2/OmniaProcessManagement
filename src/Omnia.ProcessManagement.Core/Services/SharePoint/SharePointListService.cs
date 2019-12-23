using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    internal class SharePointListService : ISharePointListService
    {
        public SharePointListService()
        {

        }

        public async ValueTask<ListItem> AddListItemAsync(PortableClientContext context, List list, Dictionary<string, dynamic> keyValuePairs)
        {
            ListItemCreationInformation itemCreateInfo = new ListItemCreationInformation();
            ListItem listItem = list.AddItem(itemCreateInfo);
            foreach (string key in keyValuePairs.Keys)
            {
                listItem[key] = keyValuePairs[key];
            }

            listItem.Update();
            context.Load(listItem, it => it.Id);
            await context.ExecuteQueryAsync();
            return listItem;
        }

        public async ValueTask<List> GetListByUrlAsync(PortableClientContext context, string listUrl, bool loadFields = false)
        {
            Uri webUri = new Uri(context.Url);
            string authorityUrl = webUri.GetLeftPart(UriPartial.Authority);
            string serverRelativeUrl = context.Url.Replace(authorityUrl, "");
            List spList = context.Web.GetList(serverRelativeUrl + "/" + listUrl);
            context.Load(spList, l => l.RootFolder.ServerRelativeUrl, l => l.Id, l => l.Title);
            if (loadFields)
            {
                context.Load(spList.Fields);
            }
            await context.ExecuteQueryAsync();

            return spList;
        }
    }
}
