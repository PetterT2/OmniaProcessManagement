using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    public interface IUnpublishProcessService
    {
        ValueTask UnpublishProcessAsync(Guid opmProcessId, Guid processTypeId, string webUrl);
    }
}
