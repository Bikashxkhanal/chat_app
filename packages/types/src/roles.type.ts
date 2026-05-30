
// for the type of user comming in the system by authenticating (normal user, SDK user )
export enum AUTH_ROLE{
    NORMAL = "normal",
    SDK = "sdk"
}

// for db storage which type of user
export enum USER_ROLE {
    TENANT = "tenant" ,
    NORMAL = "normal"
}

// type of user not in the form of enum but in type
export type USER_ROLE_TYPE  = USER_ROLE.NORMAL | USER_ROLE.TENANT

// for the conversation type
export enum CONVERSATION_TYPE {
    DIRECT = 'direct',
    GROUP = 'group'
}

//tenant role user, can be made dynamic after
export enum TENANT_USER_ROLE {
    ADMIN = "admin",
    NORMAL = "normal"
}

//media type 
export enum MEDIA_FILE_TYPE {
    image = 'IMAGE',
    video = 'VIDEO',
    audio = 'AUDIO',
    file = 'FILE'
}