using Microsoft.EntityFrameworkCore;
using Omnia.Fx.NetCore.DataMigrations;
using Omnia.ProcessManagement.Core.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.DataMigrations
{
    [DataMigrationDefinition(
      id: "f3a64614-a71b-40fe-9360-065a255bb3af",
      title: "Ensure draft-version has checked out by",
      dateTime: "2019-03-04 10:20:00 UTC")]
    internal class NavigationNodeTitleDataMigrationAction : IDataMigrationAction
    {
        public OmniaPMDbContext DatabaseContext { get; }
        public NavigationNodeTitleDataMigrationAction(OmniaPMDbContext dbContext)
        {
            DatabaseContext = dbContext;
        }

        public async ValueTask MigrateAsync()
        {
            var checkedOutProcesses = await DatabaseContext.Processes.Where(p => p.VersionType == Models.Enums.ProcessVersionType.CheckedOut).ToListAsync();
            foreach(var checkedOutProcess in checkedOutProcesses)
            {
                var draftProcess = await DatabaseContext.Processes.AsTracking().FirstOrDefaultAsync(p => p.OPMProcessId == checkedOutProcess.OPMProcessId && p.VersionType == Models.Enums.ProcessVersionType.Draft);
                draftProcess.CheckedOutBy = checkedOutProcess.CheckedOutBy;
            }
            await DatabaseContext.SaveChangesAsync();
        }
    }
}
