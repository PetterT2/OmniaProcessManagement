import { Guid } from '@omnia/fx-models';
import { SearchResultItem } from '@omnia/workplace/models';
import { Topics as WorkplaceTopics } from '@omnia/workplace';
import { Utils } from '@omnia/fx';

WorkplaceTopics.registerSearchTemplateRenderer.publish
    ({
        searchTemplate:
        {
            id: "326f5cb2-78d6-4d39-b0b2-21af55e19f5d",
            title: `Process search template`,
            switchRule: (dataRow: SearchResultItem) => {

                let contentClass = dataRow.customPropertiesResult["contentclass"];
                if (!Utils.isNullOrEmpty(contentClass) && contentClass === "STS_ListItem_DocumentLibrary")
                    return "omnia-opm-process-template";
                return undefined;
            },
            mappingProperties:
                [
                    { mappedProperty: "Title" },
                    { mappedProperty: "Date" },
                    { mappedProperty: "Person" }
                ]
            ,
            retrieveProperties: ["contentclass", "SPWebUrl", "OPMProcessDataOWSMTXT"]
        },
        weight: 10
    });