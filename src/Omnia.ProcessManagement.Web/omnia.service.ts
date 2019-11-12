import { Composer, DevelopmentEnvironment } from "@omnia/tooling/composers";
import { Guid } from '@omnia/fx/models';

Composer
    .registerManifest(new Guid("e1849a9d-4d94-4f47-b2d8-918f73df8759"), "Omnia.ProcessManagement.Web")
    .registerService({ description: "Description of Omnia.ProcessManagement.Web" })
    .AsWebApp()
    .withBuildOptions({
        include: ["client"],
        moduleOptions: {
            enableTransformResourcePath: true
        },
        bundleOptions: {
            commonsChunk: {
                name: new Guid("85f440ed-0eb1-49fe-a632-c8f5c7537eb2"),
                minChunks: 2
            }
        }
    });
    
   