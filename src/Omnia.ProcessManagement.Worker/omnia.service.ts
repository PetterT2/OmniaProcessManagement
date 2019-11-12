import { Composer, DevelopmentEnvironment } from "@omnia/tooling/composers";
import { Guid } from '@omnia/fx-models';

Composer
    .registerManifest(new Guid("ec40f243-783c-4502-8a73-36c74f8ab321"), "Omnia.ProcessManagement.Worker")
    .registerService({ description: "Description of Omnia.ProcessManagement.Worker" })
    .AsWorker();
    
   