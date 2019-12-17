using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Helpers.Security
{
    public class SecurityTrimmingHelper
    {
        public enum VersionTypeSupportTrimming
        {
            Draft = ProcessVersionType.Draft,
            LatestPublished = ProcessVersionType.LatestPublished
        }
        public readonly static string ProcessTableAlias = "P";
        public static List<Guid> Roles()
        {
            return new List<Guid>()
            {
                new Guid(OPMConstants.Security.Roles.Reader),
                new Guid(OPMConstants.Security.Roles.Author),
                new Guid(OPMConstants.Security.Roles.Reviewer),
                new Guid(OPMConstants.Security.Roles.Approver)
            };
        }

        public static string GenerateSecurityTrimming(UserAuthorizedResource resources, VersionTypeSupportTrimming versionType, List<Guid> limitedTeamAppIds, List<Guid> limitedOPMProcessIds)
        {
            var securityTrimming = string.Empty;
            var versionTrimming = $"{ProcessTableAlias}.[{nameof(Process.VersionType)}] = {(int)versionType}";

            var limitedOPMProcessIdTrimming = string.Empty;
            var limitedTeamAppIdTrimming = string.Empty;

            var connectPart = " "; //initial with one blank space
            if (resources != null)
            {
                if (resources.AuthorTeamAppIds.Any())
                {
                    var teamAppIds = resources.AuthorTeamAppIds;
                    if (limitedTeamAppIds.Any())
                    {
                        var limitedTeamAppIdsHashSet = limitedTeamAppIds.ToHashSet();
                        teamAppIds = teamAppIds.Where(appId => limitedTeamAppIdsHashSet.Contains(appId)).ToList();

                        limitedTeamAppIdTrimming = $"({GeneratePermissionForTeamAppIds(teamAppIds)})";
                    }
                    else
                    {
                        securityTrimming = $"{securityTrimming}{connectPart}{GeneratePermissionForTeamAppIds(teamAppIds)}";
                        connectPart = " OR ";
                    }
                }
                if ((resources.ApproveOPMProcessIds.Any() || resources.ReviewOPMProcessIds.Any()) && versionType == VersionTypeSupportTrimming.Draft)
                {
                    var opmProcessIds = new List<Guid>();
                    opmProcessIds.AddRange(resources.ApproveOPMProcessIds);
                    opmProcessIds.AddRange(resources.ReviewOPMProcessIds);

                    opmProcessIds = opmProcessIds.Distinct().ToList();


                    if (limitedOPMProcessIds.Any())
                    {
                        var limitedOPMProcessIdsHashSet = limitedOPMProcessIds.ToHashSet();
                        opmProcessIds = opmProcessIds.Where(opmProcessId => limitedOPMProcessIdsHashSet.Contains(opmProcessId)).ToList();

                        limitedOPMProcessIdTrimming = $"({GeneratePermissionForOPMProcessIds(opmProcessIds)})";
                    }
                    else
                    {
                        securityTrimming = $"{securityTrimming}{connectPart}{GeneratePermissionForOPMProcessIds(opmProcessIds)}";
                        connectPart = " OR ";
                    }
                }
                if (resources.LatestPublishedSecurityResourceIds.Any() && versionType == VersionTypeSupportTrimming.LatestPublished)
                {
                    securityTrimming = $"{securityTrimming}{connectPart}{GeneratePermissionForSecurityProcessId(resources.LatestPublishedSecurityResourceIds)}";
                    connectPart = " OR ";
                }
            }

            if (securityTrimming != string.Empty)
            {
                securityTrimming = $"({securityTrimming})";
            }

            if (securityTrimming != string.Empty || limitedOPMProcessIdTrimming != string.Empty || limitedTeamAppIdTrimming != string.Empty)
            {
                securityTrimming = string.Join(" AND ",
                    (new List<string> { securityTrimming, limitedOPMProcessIdTrimming, limitedTeamAppIdTrimming, versionTrimming })
                    .Where(trimming => trimming != string.Empty));
            }

            return securityTrimming;
        }

        private static string GeneratePermissionForSecurityProcessId(List<Guid> securityResourceIds)
        {
            var securityTrimming = $"{ProcessTableAlias}.[{nameof(Process.SecurityResourceId)}] IN ('{string.Join("' , '", securityResourceIds)}')";
            return securityTrimming;
        }

        private static string GeneratePermissionForOPMProcessIds(List<Guid> opmProcessIds)
        {
            var securityTrimming = $"{ProcessTableAlias}.[{nameof(Process.OPMProcessId)}] IN ('{string.Join("' , '", opmProcessIds)}')";
            return securityTrimming;
        }

        private static string GeneratePermissionForTeamAppIds(List<Guid> teamAppIds)
        {
            var securityTrimming = $"{ProcessTableAlias}.[{nameof(Process.TeamAppId)}] IN ('{string.Join("' , '", teamAppIds)}')";
            return securityTrimming;
        }
    }
}
