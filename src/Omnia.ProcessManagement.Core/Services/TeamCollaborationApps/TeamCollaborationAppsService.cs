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
        private static readonly Dictionary<string, SemaphoreSlim> _lockDict = new Dictionary<string, SemaphoreSlim>();
        private static ConcurrentDictionary<Guid, string> _appIdAndUrlDict = null;
        private static ConcurrentDictionary<string, Guid> _urlAndAppIdDict = null;

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

        public async ValueTask<Guid> GetTeamAppIdAsync(string spUrl)
        {
            spUrl = spUrl.ToLower().TrimEnd('/');
            var teamAppId = await EnsureTeamAppIdAsync(spUrl);
            return teamAppId;
        }

        public async ValueTask<Guid> EnsureTeamAppIdAsync(string spUrl)
        {
            await EnsureAppIdAndUrlDictAsync();

            if (!_urlAndAppIdDict.ContainsKey(spUrl))
            {
                var semaphoreSlim = EnsureSemaphoreSlim(spUrl);

                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (!_urlAndAppIdDict.ContainsKey(spUrl))
                    {
                        await EnsureAppIdAndUrlDictAsync(true);
                    }
                }
                finally
                {
                    semaphoreSlim.Release();
                }
            }

            if (_urlAndAppIdDict.TryGetValue(spUrl, out Guid teamAppId) && teamAppId != Guid.Empty)
            {
                return teamAppId;
            }
            else
            {
                _urlAndAppIdDict.TryAdd(spUrl, Guid.Empty);
                throw new Exception($"Invalid spUrl {spUrl}. Cannot get Team Collaboration App from this spUrl");
            }
        }

        public async ValueTask<string> EnsureSiteUrlAsync(Guid teamAppId)
        {
            var siteUrl = "";
            await EnsureAppIdAndUrlDictAsync();

            if (!_appIdAndUrlDict.ContainsKey(teamAppId))
            {
                var semaphoreSlim = EnsureSemaphoreSlim(teamAppId.ToString());

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

        public async ValueTask EnsureAppIdAndUrlDictAsync(bool force = false)
        {
            if (_appIdAndUrlDict == null)
            {
                var semaphoreSlim = EnsureSemaphoreSlim(Guid.Empty.ToString());

                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (_appIdAndUrlDict == null || force)
                    {
                        if (_appIdAndUrlDict == null)
                            _appIdAndUrlDict = new ConcurrentDictionary<Guid, string>();
                        if (_urlAndAppIdDict == null)
                            _urlAndAppIdDict = new ConcurrentDictionary<string, Guid>();

                        var teamAppInstancesOutputInfos = await AppServicce.GetAppInstanceOutputInfosAsync(OPMConstants.TeamCollaborationAppDefinitionId);
                        foreach (var appInstanceOutputInfo in teamAppInstancesOutputInfos)
                        {
                            if (appInstanceOutputInfo.OutputInfo != null && !string.IsNullOrWhiteSpace(appInstanceOutputInfo.OutputInfo.AbsoluteAppUrl))
                            {
                                var url = appInstanceOutputInfo.OutputInfo.AbsoluteAppUrl.ToLower().TrimEnd('/');
                                _urlAndAppIdDict.TryAdd(url, appInstanceOutputInfo.Id);
                                _appIdAndUrlDict.TryAdd(appInstanceOutputInfo.Id, url);
                            }
                            else
                            {
                                _appIdAndUrlDict.TryAdd(appInstanceOutputInfo.Id, null);
                            }
                        }
                    }

                }
                finally
                {
                    semaphoreSlim.Release();
                }

            }
        }

        private SemaphoreSlim EnsureSemaphoreSlim(string key)
        {
            if (!_lockDict.ContainsKey(key))
            {
                lock (_lock)
                {
                    if (!_lockDict.ContainsKey(key))
                    {
                        _lockDict.Add(key, new SemaphoreSlim(1, 1));
                    }
                }
            }

            return _lockDict[key];
        }
    }
}


