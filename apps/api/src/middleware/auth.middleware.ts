import { ApiError, asyncHandler } from "../utils";
import jwt from 'jsonwebtoken';


export const verifyJWT = asyncHandler(async(req, res) => {
    try {
        const token = req?.cookies?.accessToken || req?.header("Authorization")?.replace("Bearer ", "");

        // if token not found
        if(!token){
            throw new ApiError(401, "Unauthorized access");
        }

        // if token is available then verify the access token with secret using jwt
        const decodedInfo = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET!);

        if(!decodedInfo) throw new ApiError(401, "")

        // 
    } catch (error) {
        throw new ApiError(401, "User authenctication failed");
    }
})

