export interface PropertiesBlockDataData {
}

export interface ProcessPropertySetting {
    internalName: string;
    showLabel?: boolean;
}

export interface DatePropertySetting extends ProcessPropertySetting {
    mode: DateTimeMode
    format?: string;
}

export enum DateTimeMode {
    Default = 0,
    Normal = 1,
    Social = 2
}
