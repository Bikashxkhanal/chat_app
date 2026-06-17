// this middleware is for validating the api_key of the tenant , it validate the api key with different parameters like checking with actual api key (matching), validitity time or payment status, and request origin 

import { asyncHandler, ApiError } from "../utils";
import { ssoOrigins, partnerOriginToAcc , apiKeyMapWithOrigin} from "../constants";
import { AUTH_ROLE } from "@repo/types";
import { tenantModel } from "@repo/db-nosql";


export const verifyAPIKEY = asyncHandler(async(req , _ , next) => {
        //  get api_key from body

        const {type, api_key}  = req.body;

        if(type !== AUTH_ROLE.SDK) throw new ApiError(400, "invalid request, request origin unknown");

        if(!api_key)throw new ApiError(400, "Invalid request, api key required");

        // first validate the request origin 

        const origin  = req?.headers?.origin;
        if(!origin) throw new ApiError(400, "Invalid request");


        const tenant = await tenantModel.findOne({
                api_key : api_key
        });

        if(!tenant)throw new ApiError(400, "Invalid api key");

        if(!tenant.isApiKeyCorrect(api_key))  throw new ApiError(400, "invalid api key");

        if(!tenant.isOriginCorrect(origin)) throw new ApiError(400, "invalid request, origin didnot matched");


        req.partner = {
                tenant_id : tenant._id,
                name : tenant.name,
                api_key : tenant.api_key,
                access_token_secret : tenant.access_token_secret
        }

        next();

})