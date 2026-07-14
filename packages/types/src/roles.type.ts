// for the type of user coming in the system by authenticating (normal user, SDK user)
export const AUTH_ROLE = {
    NORMAL: "normal",
    SDK: "sdk"
} as const;

export type AUTH_ROLE =
    (typeof AUTH_ROLE)[keyof typeof AUTH_ROLE];


// for db storage which type of user
export const USER_ROLE = {
    TENANT: "tenant",
    NORMAL: "normal"
} as const;

export type USER_ROLE =
    (typeof USER_ROLE)[keyof typeof USER_ROLE];


// type of user
export type USER_ROLE_TYPE = USER_ROLE;


// for the conversation type
export const CONVERSATION_TYPE = {
    DIRECT: "direct",
    GROUP: "group"
} as const;

export type CONVERSATION_TYPE =
    (typeof CONVERSATION_TYPE)[keyof typeof CONVERSATION_TYPE];


// tenant role user, can be made dynamic later
export const TENANT_USER_ROLE = {
    ADMIN: "admin",
    NORMAL: "normal"
} as const;

export type TENANT_USER_ROLE =
    (typeof TENANT_USER_ROLE)[keyof typeof TENANT_USER_ROLE];


// media type
export const MEDIA_FILE_TYPE = {
    IMAGE: "IMAGE",
    VIDEO: "VIDEO",
    RAW : "RAW", 
    AUTO : "AUTO"
    
} as const;

export type MEDIA_FILE_TYPE =
    (typeof MEDIA_FILE_TYPE)[keyof typeof MEDIA_FILE_TYPE];