using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Settings
{
    public interface ISettingsService
    {
        ValueTask<T> GetAsync<T>() where T : Setting, new();
        ValueTask<T> GetAsync<T>(string dynamicKey) where T : DynamicKeySetting;
        ValueTask RemoveAsync<T>() where T : Setting, new();
        ValueTask RemoveAsync<T>(string dynamicKey) where T : DynamicKeySetting;
        ValueTask<T> AddOrUpdateAsync<T>(T setting) where T : Setting;

        /// <summary>
        /// This method should only be used for client-side http-request 
        /// If you want to get the settings in server-side, try to use <see cref="GetAsync"/>
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        ValueTask<Setting> GetByKeyAsync(string key);

        /// <summary>
        /// This method should only be used for client-side http-request 
        /// If you want to remove the settings in server-side, try to use <see cref="RemoveAsync"/>
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        ValueTask RemoveByKeyAsync(string key);
    }
}
