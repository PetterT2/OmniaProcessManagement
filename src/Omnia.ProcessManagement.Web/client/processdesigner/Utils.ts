import { ProcessStep, Process, ProcessReference } from '../fx/models';
import { GuidValue } from '@omnia/fx-models';

export module ProcessDesignerUtils {
    export function openProcessDesigner() {
        var designerElement = document.getElementsByTagName('opm-processdesigner');
        if (designerElement.length == 0) {
            document.querySelectorAll('.v-application--wrap')[0].appendChild(document.createElement("opm-processdesigner"));
        }
        handleEditMode();
    }
    function handleEditMode() {
        
        if (document.body.className.indexOf('opm-processdesigner-mode') < 0)
            document.body.className += " opm-processdesigner-mode";

        if (document.body.className.indexOf('opm-processdesinger-mode') < 0)
            document.body.className += " opm-processdesinger-mode";
    }
}