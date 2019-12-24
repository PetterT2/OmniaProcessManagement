using Omnia.Fx.Models.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Security
{
    public class AuthorAndDefaultReaderUpdateInput
    {
        public AuthorAndDefaultReaderUpdateInput()
        {
            Authors = new List<UserIdentity>();
            DefaultReaders = new List<UserIdentity>();
        }
        public Guid TeamAppId { get; set; }
        public List<UserIdentity> Authors { get; set; }
        public List<UserIdentity> DefaultReaders { get; set; }
    }
}
