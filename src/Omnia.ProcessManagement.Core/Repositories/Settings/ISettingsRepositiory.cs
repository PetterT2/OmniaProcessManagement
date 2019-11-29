using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Settings
{
    public interface ISettingsRepository
    {
        ValueTask<Setting> GetAsync();

        ValueTask RemoveAsync();

        ValueTask<(Setting, Setting)> AddOrUpdateAsync(Setting setting);
    }
}
