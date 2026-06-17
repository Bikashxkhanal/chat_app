import { model, Schema } from "mongoose";
import { TenantModel, ITenantMethods, ITenantDocument } from "@repo/types";


const tenantSchema = new Schema<ITenantDocument, TenantModel, ITenantMethods>(
    {
        name : {
            type : String,
            required : [true, 'Tenant is required']
        }, 
        api_key : {
            type : String,
            required : [true, 'Api Key is required'],
            unique : true
        },
        access_token_secret : {
            type : String,
            required : [true, "access token secret required"]
        },
        origin : {
            type : String,
            required : [true, "api origin required"]
        }
    },
    {
        timestamps : true
    }
)


tenantSchema.methods.isApiKeyCorrect = function(api_key : string) : boolean {
    return api_key === this.api_key;
}

tenantSchema.methods.isOriginCorrect = function(origin : string) : boolean {
    return origin.trim() === this.origin?.trim();
}

export const tenantModel = model<ITenantDocument, TenantModel>('Tenant', tenantSchema);