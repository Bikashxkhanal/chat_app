import type { Types, HydratedDocument, Model } from "mongoose";
export interface ITenant{
    id? : string;
    name : string;
    api_key : string;
    access_token_secret : string;
    origin : string;

}


export interface ITenantMethods{
    isApiKeyCorrect(api_key : string) : boolean;
    isOriginCorrect(origin : string) : boolean;
}

export interface ITenantDocument extends Omit<ITenant, "id" >{
    _id : Types.ObjectId
}

export type TenantDocument = HydratedDocument<ITenantDocument, ITenantMethods>

export type TenantModel = Model<ITenantDocument, {}, ITenantMethods>


