using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    public interface ISharePointListService
    {
        ValueTask<ListItem> AddListItemAsync(PortableClientContext context, List list, Dictionary<string, dynamic> keyValuePairs);
        ValueTask<List> GetListByUrlAsync(PortableClientContext context, string listUrl, bool loadFields = false);
        ValueTask<ListItemCollection> GetListItemsAsync(PortableClientContext context, List list, string queryParams, string viewFields, string scope, string pagingInfo, string orderBy, bool orderAscending, int? rowsPerPage = null);
        ValueTask<Folder> GetChildFolderAsync(PortableClientContext context, Folder parentFolder, string folderUrl, bool includeFiles = false, bool includeParentFolders = true, bool includeChildFolders = true);
        ValueTask<Microsoft.SharePoint.Client.Folder> GetFirstFolderInFolder(PortableClientContext clientContext, Folder parentFolder);
        ValueTask DeleteFolder(PortableClientContext clientContext, Folder folder);
        ValueTask<Folder> EnsureChildFolderAsync(PortableClientContext context, Folder parentFolder, string folderUrl, bool needToLoadItemFields = false);
        ValueTask<Microsoft.SharePoint.Client.File> UploadDocumentAsync(Web web, Folder targetFolder, string fileName, Stream stream, bool overwrite = false, bool includeListItem = false);
    }
}
