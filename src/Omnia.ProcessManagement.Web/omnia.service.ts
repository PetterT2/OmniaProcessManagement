import { Composer } from "@omnia/tooling/composers";
import { OPMService } from './client/fx/models';

Composer
    .registerManifest(OPMService.Id, "Omnia.ProcessManagement.Web")
    .registerService({ description: "Description of Omnia.ProcessManagement" })
    .AsWebApp()
    .withBuildOptions({
        include: ["client"],
        moduleOptions: {
            enableTransformResourcePath: true
        },
    })
    .requestSqlElasticPoolDatabase({
        uniqueId: "dec4dab9-2ab3-4720-9cee-d00da62a507f",
        elasticPoolId: "bb0af2ac-b021-437c-b64c-ebbdb7bde029"
    });
    
   