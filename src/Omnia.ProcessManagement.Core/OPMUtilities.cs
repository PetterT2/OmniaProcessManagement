using Omnia.Fx.Models.Language;
using Omnia.Fx.Utilities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core
{
    public static class OPMUtilities
    {
        public static uint GetLcidFromLanguage(LanguageTag? languageTag)
        {
            if (languageTag == null)
                return 1033;
            else
            {
                var cultureInfo = CultureUtils.GetCultureInfo(languageTag.Value);
                if (cultureInfo == null) return 1033;
                else return (uint)cultureInfo.LCID;
            }
        }
    }
}
