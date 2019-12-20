
export abstract class Setting {
    readonly key: string;
    constructor(key: string) {
        this.key = key;
    }
}

export abstract class DynamicKeySetting extends Setting {
    constructor(dynamicKey: string, key: string) {
        super(`${key}_$$dyanmic$$_${dynamicKey}`)
    }
}