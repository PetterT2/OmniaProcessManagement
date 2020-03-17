using Microsoft.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.ProcessManagement.Core.Extensions;
using Omnia.ProcessManagement.Core.Services.SharePoint.Helpers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.SharePoint
{
    internal class SharePointListService : ISharePointListService
    {
        public SharePointListService()
        {

        }

        public async ValueTask<ListItem> AddListItemAsync(PortableClientContext context, List list, Dictionary<string, dynamic> keyValuePairs)
        {
            ListItemCreationInformation itemCreateInfo = new ListItemCreationInformation();
            ListItem listItem = list.AddItem(itemCreateInfo);
            foreach (string key in keyValuePairs.Keys)
            {
                listItem[key] = keyValuePairs[key];
            }

            listItem.Update();
            context.Load(listItem, it => it.Id);
            await context.ExecuteQueryAsync();
            return listItem;
        }

        public async ValueTask<List> GetListByUrlAsync(PortableClientContext context, string listUrl, bool loadFields = false)
        {
            Uri webUri = new Uri(context.Url);
            string authorityUrl = webUri.GetLeftPart(UriPartial.Authority);
            string serverRelativeUrl = context.Url.Replace(authorityUrl, "");
            List spList = context.Web.GetList(serverRelativeUrl + "/" + listUrl);
            context.Load(spList, l => l.RootFolder, l => l.RootFolder.ServerRelativeUrl, l => l.Id, l => l.Title);
            if (loadFields)
            {
                context.Load(spList.Fields);
            }
            await context.ExecuteQueryAsync();

            return spList;
        }

        public async ValueTask<ListItemCollection> GetListItemsAsync(PortableClientContext context, List list, string queryParams, string viewFields, string scope,
         string pagingInfo, string orderBy, bool orderAscending, int? rowsPerPage = null)
        {
            CamlQuery camlQuery = new CamlQuery
            {
                ViewXml = SharePointCamlHelper.ParseCamlViewQuery(queryParams, viewFields, scope, orderBy, orderAscending, rowsPerPage)
            };

            if (!string.IsNullOrEmpty(pagingInfo))
            {
                var position = new ListItemCollectionPosition { PagingInfo = pagingInfo };
                camlQuery.ListItemCollectionPosition = position;
            }

            ListItemCollection listItems = list.GetItems(camlQuery);
            context.Load(listItems);
            await context.ExecuteQueryAsync();

            return listItems;
        }

        public async ValueTask<Folder> GetChildFolderAsync(PortableClientContext context, Folder parentFolder, string folderUrl, bool includeFiles = false, bool includeParentFolders = true, bool includeChildFolders = true)
        {
            Folder folder = null;

            try
            {
                if (includeParentFolders)
                {
                    context.Load(parentFolder.Folders);
                    await context.ExecuteQueryAsync();
                }

                folder = parentFolder.Folders.FirstOrDefault(f => f.Name == folderUrl);
                context.Load(folder, f => f.ServerRelativeUrl);
                if (includeFiles)
                {
                    context.Load(folder.Files);
                }
                if (includeChildFolders)
                {
                    context.Load(folder.Folders);
                }
                await context.ExecuteQueryAsync();
            }
            catch (Exception ex)
            {
                // Return null if folder not found, do not throw exception
                folder = null;
            }

            return folder;
        }

        public async ValueTask DeleteFolder(PortableClientContext clientContext, Folder folder)
        {
            if (!folder.IsObjectPropertyInstantiated("Folders") || !folder.IsObjectPropertyInstantiated("Files"))
            {
                if (!folder.IsObjectPropertyInstantiated("Folders")) clientContext.Load(folder.Folders);
                if (!folder.IsObjectPropertyInstantiated("Files")) clientContext.Load(folder.Files);
                await clientContext.ExecuteQueryAsync();
            }
            foreach (var childFolder in folder.Folders.ToList())
            {
                await DeleteFolder(clientContext, childFolder);
            }

            folder.DeleteObject();
            await clientContext.ExecuteQueryAsync();
        }

        public async ValueTask<Folder> EnsureChildFolderAsync(PortableClientContext context, Folder parentFolder, string folderUrl, bool needToLoadItemFields = false)
        {
            await context.LoadIfNeeded(parentFolder, f => f.Folders).ExecuteQueryIfNeededAsync();

            Folder folder = parentFolder.Folders.Add(folderUrl);
            context.Load(folder, f => f.ServerRelativeUrl);
            context.Load(folder.Files);
            if (needToLoadItemFields)
                context.Load(folder.ListItemAllFields);
            await context.ExecuteQueryAsync();
            return folder;
        }

        public async ValueTask<Microsoft.SharePoint.Client.File> UploadDocumentAsync(PortableClientContext ctx, Folder targetFolder, string fileName, Stream stream, bool overwrite = false, bool includeListItem = false)
        {
            string fileServerRelativeUrl = targetFolder.ServerRelativeUrl + '/' + fileName;
            stream.Seek(0, SeekOrigin.Begin);
            FileCreationInformation newFile = new FileCreationInformation();
            newFile.ContentStream = stream;
            newFile.Url = fileServerRelativeUrl;
            newFile.Overwrite = overwrite;
            Microsoft.SharePoint.Client.File uploadFile = targetFolder.Files.Add(newFile);
            if (includeListItem)
            {
                ctx.Load(uploadFile.ListItemAllFields);
                ctx.Load(uploadFile, f => f.ServerRelativeUrl);
            }
            await ctx.ExecuteQueryAsync();
            return uploadFile;
        }

        public async ValueTask<Microsoft.SharePoint.Client.File> GetFirstFileInFolder(PortableClientContext clientContext, Folder parentFolder)
        {
            Microsoft.SharePoint.Client.File file = null;

            clientContext.Load(parentFolder.Files);
            await clientContext.ExecuteQueryAsync();

            if (parentFolder.Files.Count > 0)
            {
                file = parentFolder.Files[0];
                clientContext.Load(file, f => f.ListItemAllFields, f => f.Name, f => f.ServerRelativeUrl);
                await clientContext.ExecuteQueryAsync();
            }

            return file;
        }
    }
}
