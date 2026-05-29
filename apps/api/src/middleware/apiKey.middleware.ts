// this middleware is for validating the api_key of the tenant , it validate the api key with different parameters like checking with actual api key (matching), validitity time or payment status, and request origin 

import { asyncHandler, ApiError } from "../utils";
import { ssoOrigins } from "../constants/sso-origin";
import { partnerOriginToAcc } from "../constants/partnerOrginToAcc";


export const verifyAPIKEY = asyncHandler(async(req , _ , next) => {
        //  get api_key from body

        const api_key  = req.body;

        if(!api_key?.trim())throw new ApiError(400, "Invalid request, api key required");

        // first validate the request origin 

        const origin  = req?.headers?.origin;
        if(!origin) throw new ApiError(400, "Invalid request");


       if(!ssoOrigins.includes(origin?.trim()?.toLowerCase()))throw new ApiError(400, "invalid request, origin didnot matched");

        // check api key 
        if(partnerOriginToAcc[origin.trim().toLowerCase()] !== api_key?.trim()) throw new ApiError(400, "invalid api key");

        req.partner = {
                api_key : api_key, 
                origin : origin
        }

        next();

})