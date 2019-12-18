using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Security
{
    public class UserAuthorizedResource
    {
        public UserAuthorizedResource()
        {
            AuthorTeamAppIds = new List<Guid>();
            ApproveOPMProcessIds = new List<Guid>();
            ReviewOPMProcessIds = new List<Guid>();
            LatestPublishedSecurityResourceIds = new List<Guid>();
        }
        public List<Guid> AuthorTeamAppIds { get; set; }
        public List<Guid> ApproveOPMProcessIds { get; set; }
        public List<Guid> ReviewOPMProcessIds { get; set; }
        public List<Guid> LatestPublishedSecurityResourceIds { get; set; }
    }
}
