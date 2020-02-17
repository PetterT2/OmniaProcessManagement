using Omnia.Fx.Contexts;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Core.Repositories;
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
        public readonly static string ProcessTableAlias = "P";
        public readonly static string ProcessTableName = nameof(OmniaPMDbContext.Processes);

        public readonly static string ImageReferenceTableAlias = "IR";
        public readonly static string ImageReferenceTableName = nameof(OmniaPMDbContext.ImageReferences);

        public readonly static string ProcessDataTableAlias = "PD";
        public readonly static string ProcessDataTableName = nameof(OmniaPMDbContext.ProcessData);

        public static List<Guid> Roles
        {
            get
            {
                return new List<Guid>(){
                    new Guid(OPMConstants.Security.Roles.Reader),
                    new Guid(OPMConstants.Security.Roles.Author),
                    new Guid(OPMConstants.Security.Roles.Reviewer),
                    new Guid(OPMConstants.Security.Roles.Approver)
                };
            }
        }

        public static string GenerateSecurityTrimming(UserAuthorizedResource resources, IOmniaContext omniaContext, Guid? opmProcessId, bool includeCheckedOutByOther = false)
        {
            var securityTrimming = "";

            if (resources != null)
            {
                var publishedVersionTrimming = $"{GenerateVersionTrimming((int)ProcessVersionType.Published)}";
                var archivedVersionTrimming = $"{GenerateVersionTrimming((int)ProcessVersionType.Archived)}";
                var checkedOutVersionTrimming = includeCheckedOutByOther ? $"{GenerateVersionTrimming((int)ProcessVersionType.CheckedOut)}" :
                    $"({GenerateVersionTrimming((int)ProcessVersionType.CheckedOut)} AND {GenerateCheckedOutByTrimming(omniaContext.Identity.LoginName)})";
                var notCheckedOutVersionTrimming = $"{ProcessTableAlias}.[{nameof(Process.VersionType)}] <> {(int)ProcessVersionType.CheckedOut}";
                var connectPart = "";

                var authorTeamAppIds = resources.AuthorTeamAppIds.Distinct().ToList();

                var readerSecurityResourceIds = resources.ReaderSecurityResourceIds.Distinct().ToList();
                var approverOPMProcessIds = opmProcessId.HasValue ?
                    TrimByLimitedIds(resources.ApproverOPMProcessIds, new List<Guid> { opmProcessId.Value }) :
                    resources.ApproverOPMProcessIds.Distinct().ToList();

                var reviewerOPMProcessIds = opmProcessId.HasValue ?
                    TrimByLimitedIds(resources.ReviewerOPMProcessIds, new List<Guid> { opmProcessId.Value }) :
                    resources.ReviewerOPMProcessIds.Distinct().ToList();


                var opmProcessIdTrimming = opmProcessId.HasValue ?
                    $" AND {GeneratePermissionForOPMProcessIds(new List<Guid> { opmProcessId.Value })}" : "";

                if (authorTeamAppIds.Any())
                {
                    var authorTrimming = $"{GeneratePermissionForTeamAppIds(authorTeamAppIds)}";
                    var authorTrimmingCombineWithVersion = $"({authorTrimming} AND ({notCheckedOutVersionTrimming} OR {checkedOutVersionTrimming}))";
                    securityTrimming = $"{securityTrimming}{connectPart}{authorTrimmingCombineWithVersion }";
                    connectPart = " OR ";
                }
                if (approverOPMProcessIds.Any())
                {
                    var approverTrimming = $"{GeneratePermissionForOPMProcessIds(approverOPMProcessIds)}";
                    var approverTrimmingCombineWithVersion = $"({approverTrimming} AND {notCheckedOutVersionTrimming})";
                    securityTrimming = $"{securityTrimming}{connectPart}{approverTrimmingCombineWithVersion}";
                    connectPart = " OR ";
                }
                if (reviewerOPMProcessIds.Any())
                {
                    var reviewerTrimming = $"{GeneratePermissionForOPMProcessIds(reviewerOPMProcessIds)}";
                    var reviewerTrimmingCombineWithCheckedOutVersion = $"({reviewerTrimming} AND ({notCheckedOutVersionTrimming} OR {checkedOutVersionTrimming}))";
                    securityTrimming = $"{securityTrimming}{connectPart}{reviewerTrimmingCombineWithCheckedOutVersion}";
                    connectPart = " OR ";
                }
                if (readerSecurityResourceIds.Any())
                {
                    var readerTrimming = $"{GeneratePermissionForSecurityProcessId(readerSecurityResourceIds)}";
                    var readerTrimmingCombineWithPublishedVersion = $"({readerTrimming} AND ({publishedVersionTrimming} OR {archivedVersionTrimming}))";
                    securityTrimming = $"{securityTrimming}{connectPart}{readerTrimmingCombineWithPublishedVersion}";
                    connectPart = " OR ";
                }

                if (securityTrimming != "")
                {
                    securityTrimming = $"({securityTrimming}){opmProcessIdTrimming}";
                }
            }

            return securityTrimming;
        }

        public static string GenerateSecurityTrimming(UserAuthorizedResource resources, DraftOrPublishedVersionType versionType, List<Guid> limitedTeamAppIds, List<Guid> limitedOPMProcessIds)
        {
            var securityTrimming = "";

            if (resources != null)
            {
                var versionTrimming = $" AND {GenerateVersionTrimming((int)versionType)}";

                var connectPart = "";
                var limitedOPMProcessIdTrimming = "";
                var limitedTeamAppIdTrimming = "";

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
                if (approverAndReviewerOPMProcessIds.Any() && versionType == DraftOrPublishedVersionType.Draft)
                {
                    var approverAndReviewerTrimming = $"{GeneratePermissionForOPMProcessIds(approverAndReviewerOPMProcessIds)}";
                    securityTrimming = $"{securityTrimming}{connectPart}{approverAndReviewerTrimming}";
                    connectPart = " OR ";

                }
                if (readerSecurityResourceIds.Any() && versionType == DraftOrPublishedVersionType.Published)
                {
                    var readerTrimming = $"{GeneratePermissionForSecurityProcessId(readerSecurityResourceIds)}";
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



        public static string GenerateHistorySecurityTrimming(UserAuthorizedResource resources, Guid opmProcessId)
        {
            var securityTrimming = "";

            if (resources != null)
            {
                var connectPart = "";

                var readerSecurityResourceIds = resources.ReaderSecurityResourceIds.Distinct().ToList();

                if (readerSecurityResourceIds.Any())
                {
                    var readerTrimming = $"{GeneratePermissionForSecurityProcessId(readerSecurityResourceIds, false)}";
                    securityTrimming = $"{securityTrimming}{connectPart}{readerTrimming}";
                }

                var opmProcessIdTrimming = $" AND {GeneratePermissionForOPMProcessIds(new List<Guid> { opmProcessId })}";

                if (securityTrimming != "")
                {
                    securityTrimming = $"({securityTrimming}){opmProcessIdTrimming}";
                }
            }

            return securityTrimming;
        }

        private static string GenerateCheckedOutByTrimming(string loginName)
        {
            return $"{ProcessTableAlias}.[{nameof(Process.CheckedOutBy)}] = '{loginName}'";
        }

        private static string GenerateVersionTrimming(params int[] processVersionTypes)
        {
            return $"{ProcessTableAlias}.[{nameof(Process.VersionType)}] IN ({string.Join(", ", processVersionTypes)})";
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

        private static string GeneratePermissionForSecurityProcessId(List<Guid> securityResourceIds, bool useAlias = true)
        {
            var securityTrimming = useAlias == true ? $"{ProcessTableAlias}.[{nameof(Process.SecurityResourceId)}] IN ('{string.Join("' , '", securityResourceIds)}')" :
                $"[{nameof(Process.SecurityResourceId)}] IN ('{string.Join("' , '", securityResourceIds)}')";
            return securityTrimming;
        }

        private static string GeneratePermissionForOPMProcessIds(List<Guid> opmProcessIds)
        {
            var securityTrimming = $"{ProcessTableAlias}.[{nameof(Process.OPMProcessId)}] IN ('{string.Join("' , '", opmProcessIds)}')";
            return securityTrimming;
        }

        private static string GeneratePermissionForTeamAppIds(List<Guid> teamAppIds, bool useAlias = true)
        {
            var securityTrimming = useAlias == true ? $"{ProcessTableAlias}.[{nameof(Process.TeamAppId)}] IN ('{string.Join("' , '", teamAppIds)}')" :
                $"[{nameof(Process.TeamAppId)}] IN ('{string.Join("' , '", teamAppIds)}')";
            return securityTrimming;
        }
    }
}
