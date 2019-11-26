import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('b466768f-c8b7-4bfd-ab56-4b16ca9b9fcd', "opm.new.process.dialog")
    .registerWebComponent({
        elementName: "opm-new-process-dialog",
        entryPoint: "./NewProcessDialog.jsx",
        typings: ["./INewProcessDialog.ts"]
    })
