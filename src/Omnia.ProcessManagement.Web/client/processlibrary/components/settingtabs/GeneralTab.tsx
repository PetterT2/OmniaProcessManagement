import Component from 'vue-class-component';
import * as tsx from 'vue-tsx-support';
import { Prop } from 'vue-property-decorator';
import { Localize, Inject, Utils } from '@omnia/fx';
import { ProcessLibraryLocalization } from '../../loc/localize';
import { SettingsServiceConstructor, SettingsService } from '@omnia/fx/services';
import { ProcessLibraryBlockData } from '../../../fx/models';

interface GeneralTabProps {
    settingsKey: string;
}

@Component
export class GeneralTab extends tsx.Component<GeneralTabProps>
{
    @Prop() settingsKey: string;

    @Localize(ProcessLibraryLocalization.namespace) loc: ProcessLibraryLocalization.locInterface;
    
    @Inject<SettingsServiceConstructor>(SettingsService) private settingsService: SettingsService<ProcessLibraryBlockData>;

    blockData: ProcessLibraryBlockData = null;

    created() {
        this.settingsService.getValue(this.settingsKey).then((blockData) => {
            if (blockData) {
                this.blockData = Utils.clone(blockData);
            }
        });
    }

    updateBlockData() {
        this.settingsService.setValue(this.settingsKey, this.blockData);
    }

    renderGeneralTab() {
        let h = this.$createElement;

        return (
            <div>
                <omfx-multilingual-input
                    label={this.loc.ProcessLibrarySettings.Title}
                    model={this.blockData.settings.title}
                    onModelChange={(title) => { this.blockData.settings.title = title; this.updateBlockData() }}>
                </omfx-multilingual-input>
            </div>
        )
    }

    render(h) {
        return (
            <div>
                {this.blockData ? this.renderGeneralTab() : null}
            </div>
        )
    }
}