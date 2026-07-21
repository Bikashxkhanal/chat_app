"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDIA_FILE_TYPE = exports.TENANT_USER_ROLE = exports.CONVERSATION_TYPE = exports.USER_ROLE = exports.AUTH_ROLE = void 0;
// for the type of user coming in the system by authenticating (normal user, SDK user)
exports.AUTH_ROLE = {
    NORMAL: "normal",
    SDK: "sdk"
};
// for db storage which type of user
exports.USER_ROLE = {
    TENANT: "tenant",
    NORMAL: "normal"
};
// for the conversation type
exports.CONVERSATION_TYPE = {
    DIRECT: "direct",
    GROUP: "group"
};
// tenant role user, can be made dynamic later
exports.TENANT_USER_ROLE = {
    ADMIN: "admin",
    NORMAL: "normal"
};
// media type
exports.MEDIA_FILE_TYPE = {
    IMAGE: "IMAGE",
    VIDEO: "VIDEO",
    RAW: "RAW",
    AUTO: "AUTO"
};
