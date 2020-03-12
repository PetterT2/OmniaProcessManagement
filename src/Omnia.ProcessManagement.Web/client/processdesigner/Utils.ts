import { ProcessDesignerStyles } from './ProcessDesigner.css';

export module ProcessDesignerUtils {
    export function openProcessDesigner() {
        var designerElements = document.getElementsByTagName('opm-processdesigner');
        if (designerElements.length == 0) {
            
            var designerElement = document.createElement("opm-processdesigner");
            designerElement.className = ProcessDesignerStyles.rootWrapper;
            document.body.appendChild(designerElement);
        }
        handleEditMode();
    }

    function handleEditMode() {
        if (document.body.className.indexOf('opm-processdesigner-mode') < 0)
            document.body.className += " opm-processdesigner-mode";
    }

    export function closeProcessDesigner() {
        var designerElements = document.getElementsByTagName('opm-processdesigner');
        if (designerElements.length > 0) {
            document.body.removeChild(designerElements[0]);
        }
        if (document.body.className.indexOf('opm-processdesigner-mode') >= 0) {
            document.body.className = document.body.className.replace(" opm-processdesigner-mode", '');
        }
    }
}