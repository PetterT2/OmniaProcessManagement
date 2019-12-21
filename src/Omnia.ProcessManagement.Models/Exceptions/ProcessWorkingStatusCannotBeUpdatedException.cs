using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Models.Exceptions
{
    public class ProcessWorkingStatusCannotBeUpdatedException : Exception
    {
        private static string CurrentStatusNotValidMsg = "Process with opmProcessId: {0} has current working status '{1}' is not able to update to new working status '{2}'. (Only allow to update from {3})";
        private static string NewStatusNotValidMsg = "The new status '{0}' is not available in process with version '{1}'";

        public ProcessWorkingStatusCannotBeUpdatedException(Guid opmProcessId, ProcessWorkingStatus currentProcessWorkingStatus,
            ProcessWorkingStatus newProcessWorkingStatus, List<ProcessWorkingStatus> allowToChangeFromWorkingStatuses, Exception? innerException = null) :
            base(string.Format(CurrentStatusNotValidMsg, opmProcessId, currentProcessWorkingStatus.ToString(), newProcessWorkingStatus.ToString(), string.Join(", ", allowToChangeFromWorkingStatuses.Select(s => s.ToString()))))
        {
        }

        public ProcessWorkingStatusCannotBeUpdatedException(ProcessWorkingStatus newProcessWorkingStatus, DraftOrLatestPublishedVersionType versionType, Exception? innerException = null) :
            base(string.Format(NewStatusNotValidMsg, newProcessWorkingStatus.ToString(), versionType.ToString()))
        {
        }
    }
}
