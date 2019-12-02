using Microsoft.Extensions.DependencyInjection;
using Omnia.Fx.NetCore.EnterpriseProperties;
using Omnia.ProcessManagement.Core.Repositories;

namespace Omnia.ProcessManagement.Core.EnterpriseProperties
{
    public static class EnterprisePropertyFieldProviderOptionsHelper
    {
        public static void ConfigureEnterprisePropertyFieldProvider(IEnterprisePropertyFieldProviderOptions options)
        {
            options.SetProvider<EnterprisePropertyFieldProvider>();
            options.SetDbContext<OmniaPMDbContext>();
        }
    }
}
