import { StyleFlow, OmniaTheming } from "@omnia/fx/ux";
import { ProcessPickerStyles } from '../../fx/models';
import { important } from 'csx';


StyleFlow.define(ProcessPickerStyles,
    {
        wrapper: {
            width: "100%"
        },
        loadingColor: {
            backgroundColor: 'rgba(0,0,0,0.42) !important',
            borderColor: 'rgba(0,0,0,0.42) !important'
        },
        selectedItemWrapper: {
            marginTop: '10px !important',
            padding: '0px 6px 0px 0px !important',
            $nest: {
                '.v-chip__close .v-icon': {
                    cursor: 'pointer'
                }
            }
        },
        avatarStyle: {
            justifyContent: 'center !important',
            color: 'white !important'
        }
    }
)