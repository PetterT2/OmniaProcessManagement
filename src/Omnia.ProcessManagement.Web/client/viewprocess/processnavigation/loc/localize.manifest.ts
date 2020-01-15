import { Composer } from '@omnia/tooling/composers';
import { ProcessNavigationBlockLocalization } from "./localize";

Composer.registerManifest("02c863f8-143d-4818-8074-7428d3528324")
    .registerLocalization()
    .namespace(ProcessNavigationBlockLocalization.namespace)
    .add<ProcessNavigationBlockLocalization.locInterface>({
        ProcessNavigationBlockSettings: {
            Title: "Title",
            StartLevel: "Start Level",
            GetParentSiblings: "Show Parent Siblings",
            LevelIndentation: "Level Indentation",
        }
    });