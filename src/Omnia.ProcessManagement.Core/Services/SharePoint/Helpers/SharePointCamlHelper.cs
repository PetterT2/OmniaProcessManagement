using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.SharePoint.Helpers
{
    public class SharePointCamlHelper
    {
        public static void AppendParam(StringBuilder stringBuilder, string operation, string columnName, string fieldTypeAsString, string value)
        {
            stringBuilder.AppendFormat("<{0}>", operation);

            string fieldRefPart = string.Empty;
            switch (fieldTypeAsString)
            {
                case OPMConstants.SharePoint.SharepointType.UserId:
                case OPMConstants.SharePoint.SharepointType.TaxonomyFieldType:
                case OPMConstants.SharePoint.SharepointType.TaxonomyFieldTypeMulti:
                    fieldRefPart = "<FieldRef Name='{0}' LookupId='TRUE' />";
                    break;
                default:
                    fieldRefPart = "<FieldRef Name='{0}' />";
                    break;
            }
            stringBuilder.AppendFormat(fieldRefPart, columnName);

            string valuePart = string.Empty;
            if (value != null)
            {
                switch (fieldTypeAsString)
                {
                    case OPMConstants.SharePoint.SharepointType.DateTime:
                        valuePart = "<Value Type='{1}' IncludeTimeValue='FALSE'>{0}</Value>";
                        break;
                    case OPMConstants.SharePoint.SharepointType.UserId:
                    case OPMConstants.SharePoint.SharepointType.TaxonomyFieldType:
                    case OPMConstants.SharePoint.SharepointType.TaxonomyFieldTypeMulti:
                        valuePart = "<Value Type='Integer'>{0}</Value>";
                        int flag = 0;
                        int.TryParse(value, out flag);
                        value = flag.ToString();
                        break;
                    default:
                        valuePart = "<Value Type='{1}'>{0}</Value>";
                        break;
                }
            }
            stringBuilder.AppendFormat(valuePart, value, fieldTypeAsString);

            stringBuilder.AppendFormat("</{0}>", operation);
        }

        public static string ParseCamlViewQuery(string queryParams, string viewFields, string scope, string orderBy, bool orderAscending, int? rowsPerPage = null)
        {
            string sortQuery = @"<OrderBy>
                                     <FieldRef Name='Title' Ascending='TRUE' />
                                     <FieldRef Name='FileLeafRef' Ascending='TRUE' />
                            </OrderBy>";

            if (!string.IsNullOrEmpty(orderBy) && orderBy != "Title")
            {
                sortQuery = string.Format("<OrderBy><FieldRef Name='{0}' Ascending='{1}' /></OrderBy>", orderBy, orderAscending.ToString().ToUpper());
            }
            else if (!string.IsNullOrEmpty(orderBy) && orderBy == "Title")
            {
                sortQuery = @"<OrderBy>
                                <FieldRef Name='Title' Ascending='" + orderAscending.ToString().ToUpper() + @"' />
                                <FieldRef Name='FileLeafRef' Ascending='" + orderAscending.ToString().ToUpper() + @"' />
                            </OrderBy>";
            }

            string viewFieldsArray = string.Empty;
            foreach (string viewField in viewFields.Split(';'))
            {
                if (viewField.Trim().Length > 0) viewFieldsArray += "<FieldRef Name = '" + viewField.Trim() + "' />";
            }
            string queryCaml = "";
            if (rowsPerPage.HasValue)
            {
                queryCaml = string.Format(
                                @"<View {2}>  
                            <Query> 
                                {0}
                                {3}
                            </Query> 
                            <ViewFields>{4}</ViewFields>
                             <RowLimit>{1}</RowLimit> 
                        </View>", queryParams, rowsPerPage, scope, sortQuery, viewFieldsArray);
            }
            else
            {
                queryCaml = string.Format(
                               @"<View {1}>  
                            <Query> 
                                {0}
                                {2}
                            </Query> 
                            <ViewFields>{3}</ViewFields>
                        </View>", queryParams, scope, sortQuery, viewFieldsArray);
            }
            return queryCaml;
        }
    }
}
