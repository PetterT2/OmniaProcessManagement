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
            ApproverOPMProcessIds = new List<Guid>();
            ReviewerOPMProcessIds = new List<Guid>();
            ReaderSecurityResourceIds = new List<Guid>();
        }
        public List<Guid> AuthorTeamAppIds { get; set; }
        public List<Guid> ApproverOPMProcessIds { get; set; }
        public List<Guid> ReviewerOPMProcessIds { get; set; }
        public List<Guid> ReaderSecurityResourceIds { get; set; }
    }
}
