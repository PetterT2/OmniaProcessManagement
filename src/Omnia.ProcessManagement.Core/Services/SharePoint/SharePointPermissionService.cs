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
    internal class SharePointPermissionService : ISharePointPermissionService
    {
        public SharePointPermissionService()
        {
        }

        public async ValueTask BreakListItemPermissionAsync(PortableClientContext context, ListItem item, bool copyRoleAssignments,
         bool clearSubscopes, Dictionary<Principal, List<RoleType>> roleAssignments)
        {
            await context.LoadIfNeeded(item, item => item.HasUniqueRoleAssignments).ExecuteQueryIfNeededAsync();
            await context.LoadIfNeeded(context.Web, web => web.RoleDefinitions).ExecuteQueryIfNeededAsync();


            if (!item.HasUniqueRoleAssignments)
            {
                item.BreakRoleInheritance(copyRoleAssignments, clearSubscopes);
            }
            else
            {
                item.ResetRoleInheritance();
                await context.ExecuteQueryAsync();
                item.BreakRoleInheritance(copyRoleAssignments, clearSubscopes);
            }

            foreach (var roleAssignment in roleAssignments)
            {
                RoleDefinitionBindingCollection collRoleDefinitionBinding = new RoleDefinitionBindingCollection(context);
                foreach (var roleType in roleAssignment.Value)
                {
                    collRoleDefinitionBinding.Add(context.Web.RoleDefinitions.GetByType(roleType));
                }
                item.RoleAssignments.Add(roleAssignment.Key, collRoleDefinitionBinding);
            }

            await context.ExecuteQueryAsync();
        }

    }
}