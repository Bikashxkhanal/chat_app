import {TENANT_USER_ROLE} from './roles.type'



export interface partnerUserInfoInTokenType{
    full_name : string;
    phone_number? : BigInteger;
    email : string;
    role : TENANT_USER_ROLE;
} 