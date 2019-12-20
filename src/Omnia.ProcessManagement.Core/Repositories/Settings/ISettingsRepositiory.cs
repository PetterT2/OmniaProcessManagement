using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Settings
{
    public interface ISettingsRepository
    {
        ValueTask<T> GetAsync<T>() where T : Setting, new();
        ValueTask<T> GetAsync<T>(string dynamicKey) where T : DynamicKeySetting;

        ValueTask RemoveAsync<T>() where T : Setting, new();
        ValueTask RemoveAsync<T>(string dynamicKey) where T : DynamicKeySetting;


        ValueTask<(T, T)> AddOrUpdateAsync<T>(T setting) where T : Setting;
    }
}
