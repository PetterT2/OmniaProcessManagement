using Omnia.Fx.Models.Features;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Features
{
    public interface IArchiveProcessFeatureService
    {
        ValueTask ActiveFeatureAsync(string spUrl, FeatureEventArg eventArg);
        ValueTask UpgradeFeatureAsync(string fromVersion, string spUrl, FeatureEventArg eventArg);
        ValueTask DeactiveFeatureAsync(string spUrl);
    }
}
