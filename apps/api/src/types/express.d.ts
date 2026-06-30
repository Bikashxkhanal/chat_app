import "express"
import { UserDocument, partner } from "@repo/types";
import { partnerUserInfoInTokenType } from "@repo/types";


// declaration of interface request to add user and partner in the reqest of express 
declare global{
namespace Express { 
        interface Request {
            user? : UserDocument, 

            partner? : partner, 

            partnerUser? : partnerUserInfoInTokenType

        }

}

}