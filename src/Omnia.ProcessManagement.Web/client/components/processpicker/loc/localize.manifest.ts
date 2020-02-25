import { ProcessPickerLocalization } from './localize';
import { Guid, LocaleNames } from '@omnia/fx-models';
import { Composer } from '@omnia/tooling-composers';

Composer.registerManifest(new Guid("2b0b29f0-1f77-4665-a2d8-1022baf3c885"))
    .registerLocalization({ localeName: LocaleNames.EnUs })
    .namespace(ProcessPickerLocalization.namespace)
    .add<ProcessPickerLocalization.locInterface>({
        IsRequiredMessage: "* This field is required",
        NoProcessFound: "No process found",
        DefaultLabel: "Select Process",
    });