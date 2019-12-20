using Newtonsoft.Json;
using Omnia.Fx.Caching;
using Omnia.Fx.Contexts;
using Omnia.Fx.Messaging;
using Omnia.Fx.Security;
using Omnia.ProcessManagement.Core.Repositories.Settings;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Settings
{
    internal class SettingsService : ISettingsService
    {
        private static object _lock = new object();
        private static bool _ensuredSubscribeSettingsChanges = false;
        private static Dictionary<string, Type> _settingTypes = null;
        private static Dictionary<string, Type> _dynamicKeySettingTypes = null;

        private IOmniaContext OmniaContext { get; }
        private ISecurityProvider SecurityProvider { get; }
        private ISettingsRepository SettingsRepository { get; }
        private IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> CacheHelper { get; }
        private IMessageBus MessageBus { get; }

        public SettingsService(ISettingsRepository settingsRepository,
             ISecurityProvider securityProvider,
             IOmniaMemoryDependencyCache omniaMemoryDependencyCache,
             IOmniaContext omniaContext,
             IMessageBus messageBus
          )
        {
            SettingsRepository = settingsRepository;
            SecurityProvider = securityProvider;
            OmniaContext = omniaContext;
            MessageBus = messageBus;
            CacheHelper = omniaMemoryDependencyCache.AddKeyHelper(this);
            EnsureSubscribeSettingsChanges(messageBus, CacheHelper);
            EnsureSettingTypes();
        }

        private static void EnsureSettingTypes()
        {
            if (_settingTypes == null || _dynamicKeySettingTypes == null)
            {
                lock (_lock)
                {
                    if (_settingTypes == null)
                    {
                        var settingTypes = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes())
                            .Where(x => x.IsClass && !x.IsAbstract && x.IsSubclassOf(typeof(Setting)) && x != typeof(DynamicKeySetting) && !x.IsSubclassOf(typeof(DynamicKeySetting))).ToList();

                        if (settingTypes.Count > 0)
                        {
                            _settingTypes = new Dictionary<string, Type>();
                            foreach (var settingType in settingTypes)
                            {
                                Setting setting = (Setting)Activator.CreateInstance(settingType);
                                _settingTypes.Add(setting.Key, settingType);
                            }
                        }
                    }

                    if (_dynamicKeySettingTypes == null)
                    {
                        var dynamicKeySettingTypes = AppDomain.CurrentDomain.GetAssemblies().SelectMany(x => x.GetTypes())
                            .Where(x => x.IsClass && !x.IsAbstract && x.IsSubclassOf(typeof(DynamicKeySetting))).ToList();

                        if (dynamicKeySettingTypes.Count > 0)
                        {
                            _dynamicKeySettingTypes = new Dictionary<string, Type>();
                            foreach (var dynamicKeySettingType in dynamicKeySettingTypes)
                            {
                                var setting = (DynamicKeySetting)Activator.CreateInstance(dynamicKeySettingType, "");
                                _dynamicKeySettingTypes.Add(setting.Key, dynamicKeySettingType);
                            }
                        }
                    }
                }
            }
        }
        private static void EnsureSubscribeSettingsChanges(IMessageBus messageBus, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            if (!_ensuredSubscribeSettingsChanges)
            {
                lock (_lock)
                {
                    if (!_ensuredSubscribeSettingsChanges)
                    {
                        _ensuredSubscribeSettingsChanges = true;

                        messageBus.SubscribeAsync(OPMConstants.Messaging.Topics.OnSettingsUpdated, async (settingKey) =>
                        {
                            RemoveSettingDependencyCache(settingKey.ToString(), cacheHelper);
                            await Task.CompletedTask;
                        });
                    }
                }
            }
        }


        private static void RemoveSettingDependencyCache(string settingKey, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            var dependencyCacheKey = GetSettingDependencyCacheKey(settingKey, cacheHelper);
            cacheHelper.Instance.Remove(dependencyCacheKey);

            //Also try to remove the setting cache here
            var cacheKey = GetSettingCacheKey(settingKey, cacheHelper);
            cacheHelper.Instance.Remove(cacheKey);
        }

        private static string GetSettingDependencyCacheKey(string settingKey, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            return cacheHelper.CreateKey("SettingDependency", settingKey);
        }

        private static string GetSettingCacheKey(string settingKey, IOmniaCacheWithKeyHelper<IOmniaMemoryDependencyCache> cacheHelper)
        {
            return cacheHelper.CreateKey("SettingKey", settingKey);
        }

        private ICacheDependencyResult<bool> EnsureSettingDependencyCache(string settingKey)
        {
            var key = GetSettingDependencyCacheKey(settingKey, CacheHelper);
            var cache = CacheHelper.Instance.GetOrSetDependencyCache<bool>(key, (cacheEntry) =>
            {
                return true;
            });

            return cache;
        }

        public async ValueTask<T> GetAsync<T>() where T : Setting, new()
        {
            var tObj = new T();
            //await CheckPermissionAsync(tObj.SecurityRoleId);

            var key = GetSettingCacheKey(tObj.Key, CacheHelper);

            var result = await CacheHelper.Instance.GetOrSetDependencyCacheAsync<T>(key, async (cacheEntry) =>
            {
                var dependency = EnsureSettingDependencyCache(tObj.Key);
                cacheEntry.Dependencies.Add(dependency);
                var setting = await SettingsRepository.GetAsync<T>();
                return setting;
            });

            return result.Value;
        }

        public async ValueTask<T> GetAsync<T>(string dynamicKey) where T : DynamicKeySetting
        {
            var tObj = (T)Activator.CreateInstance(typeof(T), dynamicKey);
            //await CheckPermissionAsync(tObj.SecurityRoleId);

            var key = GetSettingCacheKey(tObj.Key, CacheHelper);

            var result = await CacheHelper.Instance.GetOrSetDependencyCacheAsync<T>(key, async (cacheEntry) =>
            {
                var dependency = EnsureSettingDependencyCache(tObj.Key);
                cacheEntry.Dependencies.Add(dependency);
                var setting = await SettingsRepository.GetAsync<T>(dynamicKey);
                return setting;
            });

            return result.Value;
        }

        public async ValueTask<Setting> GetByKeyAsync(string key)
        {
            EnsureSettingTypes();
            if (DynamicKeySetting.TryGetDynamicSettingKey(key, out string dynamicKey, out string prefixKey))
            {
                if (_dynamicKeySettingTypes != null && _dynamicKeySettingTypes.TryGetValue(prefixKey, out Type dynamicType))
                {
                    var getAsyncMethod = this.GetType()
                   .GetMethods(BindingFlags.Public | BindingFlags.Instance)
                   .FirstOrDefault(x => x.Name == nameof(GetAsync) && x.IsGenericMethodDefinition && x.GetParameters().Count() == 1);

                    var getAsyncGenericMethod = getAsyncMethod.MakeGenericMethod(dynamicType);
                    var setting = await (dynamic)getAsyncGenericMethod.Invoke(this, new object[] { dynamicKey });
                    return setting;
                }
            }
            else if (_settingTypes != null && _settingTypes.TryGetValue(key, out Type type))
            {
                var getAsyncMethod = this.GetType()
                   .GetMethods(BindingFlags.Public | BindingFlags.Instance)
                   .FirstOrDefault(x => x.Name == nameof(GetAsync) && x.IsGenericMethodDefinition && x.GetParameters().Count() == 0);

                var getAsyncGenericMethod = getAsyncMethod.MakeGenericMethod(type);
                var setting = await (dynamic)getAsyncGenericMethod.Invoke(this, null);
                return setting;
            }

            throw new Exception("There is no setting model map to this key");
        }

        public async ValueTask RemoveAsync<T>() where T : Setting, new()
        {
            var tObj = new T();
            await CheckPermissionAsync(tObj.SecurityRoleId);

            var key = GetSettingCacheKey(tObj.Key, CacheHelper);
            await SettingsRepository.RemoveAsync<T>();
            CacheHelper.Instance.Remove(key);
        }

        public async ValueTask RemoveAsync<T>(string dynamicKey) where T : DynamicKeySetting
        {
            var tObj = (T)Activator.CreateInstance(typeof(T), dynamicKey);
            await CheckPermissionAsync(tObj.SecurityRoleId);

            var key = GetSettingCacheKey(tObj.Key, CacheHelper);
            await SettingsRepository.RemoveAsync<T>(dynamicKey);
            CacheHelper.Instance.Remove(key);
        }

        public async ValueTask RemoveByKeyAsync(string key)
        {
            if (DynamicKeySetting.TryGetDynamicSettingKey(key, out string dynamicKey, out string prefixKey))
            {
                if (_dynamicKeySettingTypes != null && _dynamicKeySettingTypes.TryGetValue(prefixKey, out Type dynamicType))
                {
                    var getAsyncMethod = this.GetType()
                   .GetMethods(BindingFlags.Public | BindingFlags.Instance)
                   .FirstOrDefault(x => x.Name == nameof(RemoveAsync) && x.IsGenericMethodDefinition && x.GetParameters().Count() == 1);

                    var removeAsyncGenericMethod = getAsyncMethod.MakeGenericMethod(dynamicType);
                    await (dynamic)removeAsyncGenericMethod.Invoke(this, new object[] { dynamicKey });
                }
            }
            else if (_settingTypes != null && _settingTypes.TryGetValue(key, out Type type))
            {
                var getAsyncMethod = this.GetType()
                   .GetMethods(BindingFlags.Public | BindingFlags.Instance)
                   .FirstOrDefault(x => x.Name == nameof(RemoveAsync) && x.IsGenericMethodDefinition && x.GetParameters().Count() == 0);

                var removeAsyncGenericMethod = getAsyncMethod.MakeGenericMethod(type);
                await (dynamic)removeAsyncGenericMethod.Invoke(this, null);
            }
        }

        public async ValueTask<T> AddOrUpdateAsync<T>(T setting) where T : Setting
        {
            var settingKey = setting.Key;
            Type type = null;

            EnsureSettingTypes();
            if (DynamicKeySetting.TryGetDynamicSettingKey(settingKey, out string dynamicKey, out string prefixKey))
            {
                if (_dynamicKeySettingTypes != null)
                    _dynamicKeySettingTypes.TryGetValue(prefixKey, out type);
            }
            else if (_settingTypes != null)
            {
                _settingTypes.TryGetValue(settingKey, out type);
            }

            if (type != null)
            {
                if (typeof(T) == type)
                {
                    await setting.ValidateAsync();
                    setting.CleanModelIfNeeded();
                    await CheckPermissionAsync(setting.SecurityRoleId);

                    var (newSettings, oldSettings) = await SettingsRepository.AddOrUpdateAsync(setting);
                    RemoveSettingDependencyCache(settingKey, CacheHelper);
                    await MessageBus.PublishAsync(OPMConstants.Messaging.Topics.OnSettingsUpdated, new StringBuilder(settingKey));

                    return setting;
                }
                else
                {
                    var typedSetting = JsonConvert.DeserializeObject(JsonConvert.SerializeObject(setting), type);
                    var addOrUpdateAsyncMethod = this.GetType()
                        .GetMethods(BindingFlags.Public | BindingFlags.Instance)
                        .FirstOrDefault(x => x.Name == nameof(AddOrUpdateAsync) && x.IsGenericMethodDefinition);

                    var addOrUpdateAsyncGenericMethod = addOrUpdateAsyncMethod.MakeGenericMethod(type);
                    return await (dynamic)addOrUpdateAsyncGenericMethod.Invoke(this, new object[] { typedSetting });
                }
            }
            else
            {
                throw new Exception("There is no setting model map to this key");
            }
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


