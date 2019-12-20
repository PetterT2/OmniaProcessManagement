using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    public class SharePointGroupService : ISharePointGroupService
    {
        public SharePointGroupService()
        {
        }

        public async ValueTask<List<Group>> EnsureGroupsOnWebAsync(PortableClientContext ctx, Web web, List<string> groupNames, List<RoleDefinition> roles, Principal owner = null)
        {
            List<Group> groups = new List<Group>();
            foreach (var definition in groupNames)
            {
                Group addedGroup = await EnsureGroupOnWebAsync(ctx, web, definition, roles, owner);
                ctx.Load(addedGroup);
                groups.Add(addedGroup);
            }
            await ctx.ExecuteQueryAsync();
            return groups;
        }
        public async ValueTask<Group> EnsureGroupOnWebAsync(PortableClientContext ctx, Web web, string groupName, List<RoleDefinition> roles, Principal owner = null)
        {
            var existingGroup = await TryGetGroupByNameAsync(ctx, web, groupName);

            if (existingGroup == null)
            {
                existingGroup = web.SiteGroups.Add(new GroupCreationInformation
                {
                    Title = groupName
                });
                if (owner != null) existingGroup.Owner = owner;
                existingGroup.Update();
                await web.Context.ExecuteQueryAsync();
            }

            if (roles.Count > 0)
            {
                await EnsureRoleDefinitionBindingsOnGroup(ctx, web, existingGroup, roles);
            }

            return existingGroup;
        }

        public async ValueTask<Group> TryGetGroupByNameAsync(PortableClientContext ctx, Web web, string groupName)
        {
            await ctx.LoadIfNeeded(web, w => w.SiteGroups).ExecuteQueryIfNeededAsync();         
            return web.SiteGroups.FirstOrDefault(r => r.Title == groupName);
        }

        public async ValueTask<Group> TryGetGroupByIdAsync(PortableClientContext ctx, Web web, int groupId)
        {
            await ctx.LoadIfNeeded(web, w => w.SiteGroups).ExecuteQueryIfNeededAsync();
            return web.SiteGroups.FirstOrDefault(r => r.Id == groupId);
        }

        public async ValueTask EnsureRoleDefinitionBindingsOnGroup(PortableClientContext ctx, Web web, Group group, List<RoleDefinition> roles)
        {
            var roleBindings = new RoleDefinitionBindingCollection(ctx);
            roles.ForEach(r => roleBindings.Add(r));
            web.RoleAssignments.Add(group, roleBindings);
            ctx.Load(group);
            await ctx.ExecuteQueryAsync();
        }

    }
}
