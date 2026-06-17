import { Schema, model, Document } from "mongoose";
import { TENANT_USER_ROLE } from "@repo/types";
 

interface ITenantUser extends Document{
    tenant_id : Schema.Types.ObjectId;
    user_id : Schema.Types.ObjectId;
    role : TENANT_USER_ROLE
}

const tenantUserSchema = new Schema(
    {
        tenant_id : {
            type : Schema.Types.ObjectId,
            ref : "Tenant"
        }, 
        user_id : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }, 
        role : {
            type : String,
            enum : TENANT_USER_ROLE,
            default : TENANT_USER_ROLE.NORMAL!
        }
    }, 
    {
        timestamps : true
    }
)

export const TenantUserModel = model<ITenantUser>('Tenantuser', tenantUserSchema);