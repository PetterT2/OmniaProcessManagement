using Omnia.Fx.Apps;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.TeamCollaborationApps
{
    internal class TeamCollaborationAppsService : ITeamCollaborationAppsService
    {
        private static object _lock = new object();
        private static readonly Dictionary<Guid, SemaphoreSlim> _appIdLock = new Dictionary<Guid, SemaphoreSlim>();
        private static ConcurrentDictionary<Guid, string> _appIdAndUrlDict = null;

        IAppService AppServicce { get; }
        public TeamCollaborationAppsService(IAppService appServicce)
        {
            AppServicce = appServicce;
        }

        public async ValueTask<string> GetSharePointSiteUrlAsync(Guid teamAppId)
        {
            var siteUrl = await EnsureSiteUrlAsync(teamAppId);
            return siteUrl;
        }

        public async ValueTask<string> EnsureSiteUrlAsync(Guid teamAppId)
        {
            var siteUrl = "";
            await EnsureAppIdAndUrlDictAsync();

            if (!_appIdAndUrlDict.ContainsKey(teamAppId))
            {
                var semaphoreSlim = EnsureAppIdSemaphoreSlim(teamAppId);

                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (!_appIdAndUrlDict.ContainsKey(teamAppId))
                    {
                        var teamAppInstance = await AppServicce.GetAppInstanceByIdAsync(teamAppId);

                        if (teamAppInstance == null || teamAppInstance.AppDefinitionId != OPMConstants.TeamCollaborationAppDefinitionId ||
                            teamAppInstance.OutputInfo == null || string.IsNullOrWhiteSpace(teamAppInstance.OutputInfo.AbsoluteAppUrl))
                        {
                            _appIdAndUrlDict.TryAdd(teamAppId, null);
                        }
                        else
                        {
                            _appIdAndUrlDict.TryAdd(teamAppId, siteUrl);
                        }
                    }

                }
                finally
                {
                    semaphoreSlim.Release();
                }
            }

            if (!_appIdAndUrlDict.TryGetValue(teamAppId, out siteUrl) || string.IsNullOrWhiteSpace(siteUrl))
            {
                throw new Exception($"Invalid team app with id: {teamAppId}. Cannot get SharePoint site url from this app");
            };

            return siteUrl;
        }

        private bool TryGetTeamAppUrl(Guid teamAppInstanceId, out string siteUrl)
        {
            var exists = false;
            if (_appIdAndUrlDict.TryGetValue(teamAppInstanceId, out siteUrl))
            {

                exists = true;
            }

            return exists;
        }

        public async ValueTask EnsureAppIdAndUrlDictAsync()
        {
            if (_appIdAndUrlDict == null)
            {
                var semaphoreSlim = EnsureAppIdSemaphoreSlim(Guid.Empty);

                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (_appIdAndUrlDict == null)
                    {
                        _appIdAndUrlDict = new ConcurrentDictionary<Guid, string>();
                        var teamAppInstancesOutputInfos = await AppServicce.GetAppInstanceOutputInfosAsync(OPMConstants.TeamCollaborationAppDefinitionId);
                        foreach (var appInstanceOutputInfo in teamAppInstancesOutputInfos)
                        {
                            if (appInstanceOutputInfo.OutputInfo != null && !string.IsNullOrWhiteSpace(appInstanceOutputInfo.OutputInfo.AbsoluteAppUrl))
                                _appIdAndUrlDict.TryAdd(appInstanceOutputInfo.Id, appInstanceOutputInfo.OutputInfo.AbsoluteAppUrl.TrimEnd('/'));
                            else
                                _appIdAndUrlDict.TryAdd(appInstanceOutputInfo.Id, null);
                        }
                    }

                }
                finally
                {
                    semaphoreSlim.Release();
                }

            }
        }

        private SemaphoreSlim EnsureAppIdSemaphoreSlim(Guid appId)
        {
            if (!_appIdLock.ContainsKey(appId))
            {
                lock (_lock)
                {
                    if (!_appIdLock.ContainsKey(appId))
                    {
                        _appIdLock.Add(appId, new SemaphoreSlim(1, 1));
                    }
                }
            }

            return _appIdLock[appId];
        }
    }
}


