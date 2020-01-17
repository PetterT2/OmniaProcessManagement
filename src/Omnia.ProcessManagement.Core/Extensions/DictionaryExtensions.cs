using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Extensions
{
    public static class DictionaryExtensions
    {
        public static void RenameKey<TKey, TValue>(this Dictionary<TKey, TValue> dic,
                                      TKey fromKey, TKey toKey)
        {
            TValue value = dic[fromKey];
            dic.Remove(fromKey);
            dic[toKey] = value;
        }
    }
}
