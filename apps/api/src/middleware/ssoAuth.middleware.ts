import { asyncHandler } from "../utils";
import { ApiError } from "@repo/utils";
import jwt, {JwtPayload} from 'jsonwebtoken';
import { partnerUserInfoInTokenType } from "@repo/types";

interface ssoPayload extends JwtPayload, partnerUserInfoInTokenType{};

export const ssoVerifyJWT = asyncHandler(async(req, _, next) => {
    // get the access token from the external application from the authorization header , if not available in authorization header take it from cookies (prefred:: Bearer , cookie name can be different for diffrent external application)

    // console.log("INsdie sso verify jwt");
    try {
        const token = req?.header("Authorization")?.replace("Bearer ", "") || req?.cookies?.accessToken;
        if(!token) throw new ApiError(401, "Unauthorized access");
    
        const origin = req?.headers?.origin;
        if(!origin) throw new ApiError(400, "invalid request, origin missing");
    
        const { access_token_secret } = req?.partner; 
        const decodedToken = jwt.verify(token , access_token_secret) as ssoPayload  ;
    
        // to verify the token we need to know the secret key of accesstoken of the external application and must identify the accurate token that matches to the exact external application
        
        if(!decodedToken) throw new ApiError(401, "Unauthorized access");
    
        // relavant info of user from the token:: email, phone_number and full_name
        req.partnerUser = {
            phone_number : decodedToken.phone_number,
            full_name : decodedToken.name,
            email : decodedToken?.email,
            role : decodedToken?.role
        };
        // console.log("After sso auth");
    } catch (error : any) {
        throw new ApiError(500, error.message)
    }
    
  
    next();
});