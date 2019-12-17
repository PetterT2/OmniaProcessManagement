using Microsoft.SharePoint.Client;
using Omnia.Fx.Models.Language;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    internal class SharePointSiteService : ISharePointSiteService
    {
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        public SharePointSiteService(ISharePointClientContextProvider sharePointClientContextProvider)
        {
            SharePointClientContextProvider = sharePointClientContextProvider;
        }

        public async ValueTask<(Guid, Guid)> GetSiteIdentityAsync(string webUrl)
        {
            PortableClientContext ctx = SharePointClientContextProvider.CreateClientContext(webUrl);
            ctx.Load(ctx.Site, s => s.Id);
            ctx.Load(ctx.Web, s => s.Id);
            ctx.Load(ctx.Web.CurrentUser, us => us.LoginName);
            await ctx.ExecuteQueryAsync();
            
            return (ctx.Site.Id, ctx.Web.Id);
        }
    }
}