using Omnia.Fx.Caching;
using Omnia.Fx.Contexts;
using Omnia.Fx.Messaging;
using Omnia.Fx.Security;
using Omnia.ProcessManagement.Core.Repositories.Settings;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Settings
{
    internal class SettingsService : ISettingsService
    {
        private IOmniaContext OmniaContext { get; }
        private ISecurityProvider SecurityProvider { get; }
        private ISettingsRepository SettingsRepository { get; }

        public SettingsService(ISettingsRepository settingsRepository,
             ISecurityProvider securityProvider,
             IOmniaContext omniaContext
          )
        {
            SettingsRepository = settingsRepository;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
        }

        public async ValueTask<Setting> GetAsync()
        {
            var setting = await SettingsRepository.GetAsync();
            return setting;
        }

        public async ValueTask RemoveAsync()
        {
            var tObj = new Setting();
            await CheckPermissionAsync(tObj.SecurityRoleId);
            await SettingsRepository.RemoveAsync();
        }

        public async ValueTask<Setting> AddOrUpdateAsync(Setting setting)
        {
            await setting.ValidateAsync();
            setting.CleanModelIfNeeded();
            await CheckPermissionAsync(setting.SecurityRoleId);

            var (newSettings, oldSettings) = await SettingsRepository.AddOrUpdateAsync(setting);
            return setting;
        }

        private async ValueTask CheckPermissionAsync(Guid securityRoleId)
        {
            var identityRolesResult = await SecurityProvider.GetIdentityRolesForCurrentServiceAsync(OmniaContext.Identity.LoginName);
            var identityRoles = identityRolesResult.Values
                    .Where(r => r.HasPermission == true)
                    .Select(r => r.RoleId)
                    .ToList();
            var hasPermission = identityRoles.Any(
                roleId => roleId == Omnia.Fx.Constants.Security.RoleDefinitions.ApiFullControl.Id ||
                    roleId == securityRoleId);

            if (!hasPermission)
                throw new UnauthorizedAccessException($"Access denied for security role id: {securityRoleId}");
        }
    }
}


