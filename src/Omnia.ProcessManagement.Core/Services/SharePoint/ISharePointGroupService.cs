using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    public interface ISharePointGroupService
    {
        ValueTask<Group> TryGetGroupByNameAsync(PortableClientContext ctx, Web web, string groupName);
        ValueTask<Group> TryGetGroupByIdAsync(PortableClientContext ctx, Web web, int groupId);
        ValueTask<Group> EnsureGroupOnWebAsync(PortableClientContext ctx, Web web, string groupName, List<RoleDefinition> roles, Principal owner = null, List<User> users = null);
        ValueTask<List<Group>> EnsureGroupsOnWebAsync(PortableClientContext ctx, Web web, List<string> groupNames, List<RoleDefinition> roles, Principal owner = null, List<User> users = null);
        ValueTask EnsureRemoveGroupOnWebAsync(PortableClientContext ctx, Web web, string groupName);
    }
}