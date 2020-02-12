using Microsoft.SharePoint.Client;
using Omnia.Fx.Models.Users;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.Helpers.Security;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Security
{
    public interface IProcessSecurityService
    {
        ValueTask<string> GetRollupSecurityTrimmingQuery(ProcessVersionType versionType);
        ValueTask<IAuthorizedProcessQuery> InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType versionType, List<Guid> limitedTeamAppIds = null, List<Guid> limitedOPMProcessIds = null);
        ValueTask<IAuthorizedProcessQuery> InitAuthorizedProcessByProcessStepIdQueryAsync(Guid processStepId, bool includeCheckedOutByOther = false);
        ValueTask<IAuthorizedProcessQuery> InitAuthorizedProcessByOPMProcessIdQueryAsync(Guid opmProcessId, bool includeCheckedOutByOther = false);
        ValueTask<IAuthorizedImageReferenceQuery> InitAuthorizedImageReferenceQueryAsync(ImageReference imageRef, Guid opmProcessId);
        ValueTask<IAuthorizedProcessQuery> InitAuthorizedProcessHistoryByOPMProcessIdQueryAsync(Guid opmProcessId);

        IOnlyTeamAppIdSecurityResponse InitSecurityResponseByTeamAppId(Guid teamAppId);
        ValueTask<ISecurityResponse> InitSecurityResponseByOPMProcessIdAsync(Guid opmProcessId, ProcessVersionType processVersionType);
        ValueTask<ISecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId, string hash);
        ValueTask<ISecurityResponse> InitSecurityResponseByProcessStepIdAsync(Guid processStepId);
        ValueTask<ISecurityResponse> InitSecurityResponseByProcessIdAsync(Guid processId);
        ValueTask<UserAuthorizedResource> EnsureUserAuthorizedResourcesCacheAsync();
        ValueTask<Microsoft.SharePoint.Client.Group> EnsureLimitedReadAccessSharePointGroupAsync(PortableClientContext ctx, Guid opmProcessId);
        ValueTask EnsureRemoveLimitedReadAccessSharePointGroupAsync(PortableClientContext ctx, Guid opmProcessId);

        ValueTask EnsureReadPermissionOnProcessLibraryAsync(PortableClientContext ctx, Principal principal);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="teamAppId"></param>
        /// <param name="opmProcessId"></param>
        /// <param name="limitedUserItentities">null mean using default reader</param>
        /// <returns></returns>
        ValueTask<Guid> AddOrUpdateOPMReaderPermissionAsync(Guid teamAppId, Guid opmProcessId, List<UserIdentity> limitedUserItentities = null);
        ValueTask AddOrUpdateOPMApproverPermissionAsync(Guid opmProcessId, string userLoginName);
        ValueTask RemoveOPMApproverPermissionAsync(Guid opmProcessId);

        ValueTask AddOrUpdateOPMAuthorAndDefaultReaderAsync(PortableClientContext ctx, AuthorAndDefaultReaderUpdateInput updateInput);
    }
}
