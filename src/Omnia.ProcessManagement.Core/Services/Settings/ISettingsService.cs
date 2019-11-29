using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Settings
{
    public interface ISettingsService
    {
        ValueTask<Setting> GetAsync();
        ValueTask RemoveAsync();
        ValueTask<Setting> AddOrUpdateAsync(Setting setting);
    }
}
