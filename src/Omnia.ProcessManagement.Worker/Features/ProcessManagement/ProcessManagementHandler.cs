﻿using Microsoft.Extensions.Logging;
using Omnia.Fx.EnterpriseProperties;
using Omnia.Fx.NetCore.Features.Attributes;
using Omnia.Fx.NetCore.Features.FeatureProviders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.ShapeGalleryItems;

namespace Omnia.ProcessManagement.Worker.Features.ProcessManagement
{
    [OmniaFeature(id: "af2678fd-e2d5-466f-b8fb-3c5a61a3defe")]
    internal class ProcessManagementHandler : BaseFeatureProvider
    {
        ILogger<ProcessManagementHandler> Logger { get; }
        IEnterprisePropertyService EnterprisePropertyService { get; }
        IShapeGalleryItemService ShapeGalleryItemService { get; }

        public ProcessManagementHandler(ILogger<ProcessManagementHandler> logger,
            IEnterprisePropertyService enterprisePropertyService,
            IShapeGalleryItemService shapeGalleryItemService) : base()
        {
            Logger = logger;
            EnterprisePropertyService = enterprisePropertyService;
            ShapeGalleryItemService = shapeGalleryItemService;
        }

        protected override async Task ActivateAsync()
        {
            try
            {
                await ProvisionDefaultProperties();
            }
            catch (Exception ex)
            {
                Logger.LogError($"Error OPM ProcessManagementHandler", ex);
                throw ex;
            }
        }

        private async Task ProvisionDefaultProperties()
        {
            List<Task> EnsureBuiltInDataTask = new List<Task>();

            var (allProperties, cacheDependency) = await EnterprisePropertyService.GetAllAsync();
            foreach (var property in OPMConstants.Features.OPMDefaultProperties.Properties)
            {
                var currentProperty = allProperties.FirstOrDefault(p => p.InternalName == property.InternalName);
                if (currentProperty == null)
                {
                    EnsureBuiltInDataTask.Add(Task.Run(() =>
                    {
                        try
                        {
                            EnterprisePropertyService.CreatePropertyAsync(property).GetAwaiter().GetResult();
                        }
                        catch (Exception ex)
                        {
                            Logger.LogError($"ProcessManagement - Add property {property.InternalName} ERROR: {ex.Message}", ex);
                        }
                    }));
                }
            }

            var allShapeGalleryItems = await ShapeGalleryItemService.GetAllAsync();
            foreach(var galleryItem in OPMConstants.Features.OPMDefaultShapeGalleryItems.ShapeGalleryItems)
            {
                var currentItem = allShapeGalleryItems.FirstOrDefault(i => i.Id == galleryItem.Id);
                if(currentItem == null)
                {
                    EnsureBuiltInDataTask.Add(Task.Run(() =>
                    {
                        try
                        {
                            ShapeGalleryItemService.AddOrUpdateAsync(galleryItem).GetAwaiter().GetResult();
                        }
                        catch (Exception ex)
                        {
                            Logger.LogError($"ProcessManagement - Add built-in shape gallery item {galleryItem.Id} ERROR: {ex.Message}", ex);
                        }
                    }));
                }
            }

            Task.WhenAll(EnsureBuiltInDataTask).GetAwaiter().GetResult();
        }

        protected override Task DeactivateAsync(string fromVersion)
        {
            return Task.CompletedTask;
        }

        protected override async Task UpgradeAsync(string fromVersion)
        {
            Logger.LogInformation("Upgrade OPM ProcessManagementHandler");
            await ProvisionDefaultProperties();
        }
    }
}
