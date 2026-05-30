import "express"
import { UserDocument } from "@repo/types";
import { partnerUserInfoInTokenType } from "@repo/types";


// declaration of interface request to add user and partner in the reqest of express 
declare module "express" { 
        interface Request {
            user? : UserDocument, 

            partner? : {
                api_key : string;
                origin : string;
            }, 

            partnerUser : partnerUserInfoInTokenType

        }

}