'use strict';
import { registerManifestsReference, registerWebComponentDefinitions } from "@omnia/tooling-vue";

Object.defineProperty(exports, "__esModule", { value: true });

const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');


export function init() {
    registerManifestsReference([
        {
            path: 'node_modules/@omnia/dm/internal-do-not-import-from-here/manifests/omnia.pm.fx.manifest.json',
            serviceId: 'e1849a9d-4d94-4f47-b2d8-918f73df8759',
            resourceId: '52d954c2-e55d-4e19-9276-b6c1b109044e'
        }
    ])

    let wcdefinitionsPath = path.resolve(__dirname, "./internal-do-not-import-from-here/wcdefinitions.json");
    if (fsExtra.existsSync(wcdefinitionsPath)) {
        registerWebComponentDefinitions(fsExtra.readJSONSync(wcdefinitionsPath));
    }
}

//exports.init = init;
