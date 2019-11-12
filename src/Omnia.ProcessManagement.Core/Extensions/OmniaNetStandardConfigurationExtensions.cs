using Omnia.Fx.HostConfiguration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Extensions
{
    public static class OmniaNetStandardConfigurationExtensions
    {
        public static T AddOmniaPMCore<T>(this T config) where T : IOmniaNetStandardConfiguration
        {
            return (T)ConfigOmniaCore(config);
        }

        private static T ConfigOmniaCore<T>(T config) where T : IOmniaNetStandardConfiguration
        {
            config
                .ConfigureServices(services =>
                {
                    config.RunOneTimeOnly(() =>
                    {
                        services.AddOmniaPMComponents();
                        config.Configuration((configurationBuilder) => {
                            var configuration = configurationBuilder.Build();
                            services.AddOmniaCoreOptionSettings(configuration);
                        });
                    });
                });

            return config;
        }
    }
}
