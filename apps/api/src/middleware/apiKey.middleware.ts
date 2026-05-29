// this middleware is for validating the api_key of the tenant , it validate the api key with different parameters like checking with actual api key (matching), validitity time or payment status, and request origin 

import { asyncHandler, ApiError } from "../utils";
import { partnerOriginToAccMap } from "../constants/partnerOrginToAcc";
import { ssoOriginType } from "../constants/sso-origin";

export const verifyAPIKEY = asyncHandler(async(req , _ , next) => {
        //  get api_key from body

        const api_key  = req.body;

        if(!api_key?.trim())throw new ApiError(400, "Invalid request, api key required");

        // first validate the request origin 

        const origin = req?.headers?.origin;
        if(!origin) throw new ApiError(400, "Invalid request");

        // then api key

        // then validitity time


        next();


})