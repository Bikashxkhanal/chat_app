import { userModel } from "@repo/db-nosql";
import { asyncHandler } from "../utils";
import jwt, {JwtPayload} from 'jsonwebtoken';
import { ApiError } from "@repo/utils";


// interface for jwt payload for type safety
interface jwtPayload extends JwtPayload{
    _id : string;

}

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req?.cookies?.chatappAccessToken || req?.header("Authorization")?.replace("Bearer ", "");

        // if token not found
        if(!token){
            throw new ApiError(401, "Unauthorized access");
        }

        // if token is available then verify the access token with secret using jwt
        const decodedInfo = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET!) as jwtPayload;
        // console.log(decodedInfo);
        

        // console.log(decodedInfo);
        
        if(!decodedInfo) throw new ApiError(401, "session expired"); //must invoke refresh endpoint to regenerate the access token 

        // get the user info by extracting the _id from decodedInfo
        const user = await userModel.findById(decodedInfo._id).select("-hashed_password -refreshToken");
        // console.log(user);
        

        if(!user) throw new ApiError(400, "cannot find user");

        req.user = user;
        next();
        
    } catch (error: any) {
        throw new ApiError(401, error.message);
    }
});

