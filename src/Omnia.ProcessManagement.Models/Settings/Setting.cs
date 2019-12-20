using Newtonsoft.Json;
using Omnia.Fx;
using Omnia.Fx.Models.JsonTypes;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Models.Settings
{
    public class Setting : OmniaJsonBase
    {
        private bool _cleanModel;
        public Setting(string key, Guid securityRoleId, bool cleanModel)
        {
            Key = key.ToLower();
            SecurityRoleId = securityRoleId;
            _cleanModel = cleanModel;
        }

        public string Key { get; set; }

        [JsonIgnore]
        public Guid SecurityRoleId { get; }

        public void CleanModelIfNeeded()
        {
            if (_cleanModel && AdditionalProperties != null)
            {
                AdditionalProperties.Clear();
            }
        }

        public virtual ValueTask ValidateAsync()
        {
            return new ValueTask();
        }
    }

    public class DynamicKeySetting : Setting
    {
        private static readonly string _dyanmicToken = "_$$dyanmic$$_";
        public DynamicKeySetting(string dynamicKey, string staticKey, Guid securityRoleId, bool cleanModel) :
            base($"{staticKey}{_dyanmicToken}{dynamicKey}".ToLower(), securityRoleId, cleanModel)
        {

        }

        public static bool TryGetDynamicSettingKey(string settingKey, out string dynamicKey, out string prefixKey)
        {
            var isDynamicKey = false;
            dynamicKey = "";
            prefixKey = "";
            if (settingKey.Contains(_dyanmicToken))
            {
                isDynamicKey = true;
                prefixKey = settingKey.Split(_dyanmicToken)[0] + _dyanmicToken;
                dynamicKey = settingKey.Split(_dyanmicToken)[1];
            }

            return isDynamicKey;
        }
    }
}
