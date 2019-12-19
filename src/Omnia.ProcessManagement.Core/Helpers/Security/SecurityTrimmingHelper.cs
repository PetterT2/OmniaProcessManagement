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
            var securityTrimming = "";
            var versionTrimming = $" AND {ProcessTableAlias}.[{nameof(Process.VersionType)}] = {(int)versionType}";

            var connectPart = "";
            var limitedOPMProcessIdTrimming = "";
            var limitedTeamAppIdTrimming = "";

            if (resources != null)
            {
                var readerSecurityResourceIds = resources.ReaderSecurityResourceIds.Distinct().ToList();
                var authorTeamAppIds = TrimByLimitedIds(resources.AuthorTeamAppIds, limitedTeamAppIds);
                var approverAndReviewerOPMProcessIds = new List<Guid>();
                approverAndReviewerOPMProcessIds.AddRange(resources.ApproverOPMProcessIds);
                approverAndReviewerOPMProcessIds.AddRange(resources.ReviewerOPMProcessIds);
                approverAndReviewerOPMProcessIds = TrimByLimitedIds(approverAndReviewerOPMProcessIds, limitedOPMProcessIds);

                if (limitedOPMProcessIds.Any())
                {
                    limitedOPMProcessIdTrimming = $" AND {GeneratePermissionForOPMProcessIds(limitedOPMProcessIds)}";
                }
                if (limitedTeamAppIds.Any())
                {
                    limitedTeamAppIdTrimming = $" AND {GeneratePermissionForTeamAppIds(limitedTeamAppIds)}";
                }

                if (authorTeamAppIds.Any())
                {
                    var authorTrimming = $"{GeneratePermissionForTeamAppIds(authorTeamAppIds)}";
                    securityTrimming = $"{securityTrimming}{connectPart}{authorTrimming}";
                    connectPart = " OR ";
                }
                if (approverAndReviewerOPMProcessIds.Any() && versionType == VersionTypeSupportTrimming.Draft)
                {
                    var approverAndReviewerTrimming = $"{GeneratePermissionForOPMProcessIds(approverAndReviewerOPMProcessIds)}";
                    securityTrimming = $"{securityTrimming}{connectPart}{approverAndReviewerTrimming}";
                    connectPart = " OR ";

                }
                if (resources.ReaderSecurityResourceIds.Any() && versionType == VersionTypeSupportTrimming.LatestPublished)
                {
                    var readerTrimming = $"{GeneratePermissionForSecurityProcessId(resources.ReaderSecurityResourceIds)}";
                    securityTrimming = $"{securityTrimming}{connectPart}{readerTrimming}";
                    connectPart = " OR ";
                }

                if (securityTrimming != "")
                {
                    securityTrimming = $"({securityTrimming}){limitedOPMProcessIdTrimming}{limitedTeamAppIdTrimming}{versionTrimming}";
                }
            }

            return securityTrimming;
        }

        private static List<Guid> TrimByLimitedIds(List<Guid> ids, List<Guid> limitedIds)
        {
            if (ids.Any())
            {
                if (limitedIds.Any())
                {
                    var limitedIdHashSet = limitedIds.ToHashSet();
                    ids = ids.Where(id => limitedIdHashSet.Contains(id)).ToList();
                }
            }

            return ids.Distinct().ToList();
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
