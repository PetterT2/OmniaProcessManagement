using Microsoft.SharePoint.Client;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Omnia.ProcessManagement.Core
{
    public static class OPMUtilities
    {
        public static string GenerateGraphApiQueryFilterStartwithByField(string fieldName, string value)
        {
            return string.Format("startswith(fields/{0},'{1}')", fieldName, value);
        }

        public static string GenerateGraphApiQueryFilterNotEqualByField(string fieldName, string value)
        {
            return string.Format("(fields/{0} ne '{1}')", fieldName, value);
        }
        public static string GenerateGraphApiQueryFilterEqualByField(string fieldName, string value)
        {
            return string.Format("(fields/{0} eq '{1}')", fieldName, value);
        }

        public static string GenerateGraphApiQueryAndJoinFilter(List<string> filterQueries)
        {
            return string.Format("filter=({0})", String.Join(" and ", filterQueries));
        }

        public static string GenerateGraphApiOrderBy(string sortBy, bool sortAsc)
        {
            string orderByQuery = string.Format("orderby=fields/{0}", sortBy);
            if (!sortAsc) orderByQuery += " desc";
            return orderByQuery;
        }

        public static void CopyStream(ClientResult<Stream> source, Stream destination)
        {
            int position = 1;
            int bufferSize = 200000;
            byte[] readBuffer = new byte[bufferSize];
            while (position > 0)
            {
                position = source.Value.Read(readBuffer, 0, bufferSize);
                destination.Write(readBuffer, 0, position);
                readBuffer = new byte[bufferSize];
            }
            destination.Flush();
        }
    }
}
