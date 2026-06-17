import {TENANT_USER_ROLE} from './roles.type'
import { Types } from 'mongoose';



export interface partnerUserInfoInTokenType{
    full_name : string;
    phone_number : string;
    email? : string;
    role? : TENANT_USER_ROLE;
} 

export interface partner {
    tenant_id : Types.ObjectId;
    name : string;
    api_key : string;
    access_token_secret : string;        
}