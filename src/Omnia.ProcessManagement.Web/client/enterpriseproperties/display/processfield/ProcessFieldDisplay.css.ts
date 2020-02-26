import { important } from "csx";
import { StyleFlow } from '@omnia/fx/ux';
import { ProcessFieldDisplayStyles } from '../../../fx/models';

StyleFlow.define(ProcessFieldDisplayStyles, {
    processList: {
        padding: important('0px'),
        backgroundColor: important('transparent'),
    },
    process: {
        $nest: {
            '.v-list__tile': {
                padding: important('0px'),
                fontSize: important('inherit')
            },
            '.v-list__tile__avatar': {
                minWidth: important('40px')
            }
        }
    }
});
