import {AUTH_ROLE} from './roles.type'


export interface localLoginBody {
    type : AUTH_ROLE.NORMAL;
    phone_number : bigint
    password : string
}

export interface sdkLoginBody {
    type : AUTH_ROLE.SDK
    api_key : string;
    access_token : string;
   
}

export interface preLocalRegisterBody {
    type : AUTH_ROLE.NORMAL;
    phone_number : bigint;
}

export interface localRegisterBody {
    type : AUTH_ROLE.NORMAL;
    phone_number : bigint;
    password : string;
    confirm_password : string;
}

// will update when needed 
export interface sdkRegisterBody {
    type : AUTH_ROLE.SDK
}





export type loginBody = localLoginBody | sdkLoginBody
export type registerBody = localRegisterBody | sdkRegisterBody