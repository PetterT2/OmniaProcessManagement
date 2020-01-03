import { Composer } from '@omnia/tooling/composers';
import { TasksBlockLocalization } from "./localize";

Composer.registerManifest("15bcc8e5-e326-496a-ab61-d1a1dc85dc2a")
    .registerLocalization()
    .namespace(TasksBlockLocalization.namespace)
    .add<TasksBlockLocalization.locInterface>({
        TasksBlockSettings: {
            Title: "Title"
        }
    });