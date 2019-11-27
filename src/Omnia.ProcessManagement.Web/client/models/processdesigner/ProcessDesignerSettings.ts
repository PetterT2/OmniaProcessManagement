
export enum DisplayModes {
    contentEditing, contentPreview
}

export enum UserExperience {
    simple, advanced
}

export interface ProcessDesignerSettings {
    showContentNavigation: boolean,
    displayMode: DisplayModes,
    userExperience: UserExperience,
    itemIsCheckOut :boolean
}

export interface ModeMessage {
    edit: boolean,
    launchEditor?:boolean
    displayMode?: DisplayModes
}

