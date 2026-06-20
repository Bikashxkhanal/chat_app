import {AUTH_ROLE} from './roles.type'


export interface localLoginBody {
    type :typeof AUTH_ROLE.NORMAL;
    phone_number : string
    password : string
}

export interface sdkLoginBody {
    type :typeof AUTH_ROLE.SDK
    api_key : string;
    access_token : string;
   
}

export interface preLocalRegisterBody {
    type :typeof AUTH_ROLE.NORMAL;
    phone_number : string;
}

export interface localRegisterBody {
    type :typeof AUTH_ROLE.NORMAL;
    phone_number : string;
    password : string;
    confirm_password : string;
}

// will update when needed 
export interface sdkRegisterBody {
    type :typeof AUTH_ROLE.SDK
}


export type loginBody = localLoginBody | sdkLoginBody
export type registerBody = localRegisterBody | sdkRegisterBody