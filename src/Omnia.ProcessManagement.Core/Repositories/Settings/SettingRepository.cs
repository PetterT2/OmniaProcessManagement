using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Settings
{
    internal class SettingsRepository : RepositoryBase<Entities.Settings.Setting>, ISettingsRepository
    {
        public SettingsRepository(OmniaPMDbContext databaseContext) : base(databaseContext) { }

        public async ValueTask<(Setting, Setting)> AddOrUpdateAsync(Setting setting)
        {
            if (setting == null)
            {
                throw new Exception("Setting cannot be null");
            }

            var dbEntity = await _dbSet.AsTracking().FirstOrDefaultAsync(s => s.Key == setting.Key);
            Setting dbModel = null;
            if (dbEntity == null)
            {
                dbEntity = new Entities.Settings.Setting
                {
                    Key = setting.Key,
                    Value = JsonConvert.SerializeObject(setting)
                };
                _dbSet.Add(dbEntity);
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(dbEntity.Value))
                {
                    dbModel = JsonConvert.DeserializeObject<Setting>(dbEntity.Value);
                }

                dbEntity.Value = JsonConvert.SerializeObject(setting);
            }

            await _dataContext.SaveChangesAsync();

            return (setting, dbModel);
        }

        public async ValueTask<Setting> GetAsync()
        {
            Setting tObj = new Setting();
            var setting = await _dbSet.FirstOrDefaultAsync(s => s.Key == tObj.Key);

            if (setting == null || string.IsNullOrWhiteSpace(setting.Value))
                return null;

            Setting result = JsonConvert.DeserializeObject<Setting>(setting.Value);
            return result;
        }

        public async ValueTask RemoveAsync()
        {
            Setting tObj = new Setting();
            var setting = await _dbSet.AsTracking().FirstOrDefaultAsync(s => s.Key == tObj.Key);

            if (setting != null)
            {
                _dbSet.Remove(setting);
                await _dataContext.SaveChangesAsync();
            }
        }

    }
}
