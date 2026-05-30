import { asyncHandler, ApiResponse, ApiError } from "../../utils";
import { loginBody , AUTH_ROLE, registerBody, preLocalRegisterBody} from "@repo/types";
import { userModel } from "@repo/db-nosql";
import { cookieOptions } from "../../constants/index";


export const login = asyncHandler(async (req, res, next) => {
       const body : loginBody = req?.body;

    //  if the body is of type local then validation should be performed as like that and if it is skd then it should be performed like that

    // if the authenctication type doesnot belong to both then thrown an eror
    if(body.type !== AUTH_ROLE.NORMAL && body.type !== AUTH_ROLE.SDK){
        throw new ApiError(400, "Invalid login type")
    }

    // if the user auth type is normal then follow this login moddule
    if(body.type === AUTH_ROLE.NORMAL){
        // the boyd is type local so validate phone_number and password and perfrom necessary operations

        if(!body.phone_number || !body.password?.trim()){
            // throw an api error
            throw new ApiError(400, "Both phone number and password is required", ['missing phone number or password']);
        }

        try {

            const user = await userModel.findOne({
                    phone_number : body.phone_number
            }).select("-hashed_password");

            // if user doesnot exists
            if(!user){
                throw new ApiError(400, "User with such phone number doesnot exists");
            }
            
            // normal user cannot contain tenant id
            if(user?.tenant_id){
                throw new ApiError(400, "User type didnot matched");
            }

            // comparing password
          const isPasswordCorrect = await user.isPasswordCorrect(body.password?.trim());

            // if incorrect , exit
          if(!isPasswordCorrect){
            throw new ApiError(400, "Incorrect password");
          }

        //   if the password is correct, then generate , refresh and acess tokens 

         const accessToken = user.generateAccessToken();
         const refreshToken = user.generateRefreshToken();

         const userWithRefreshToken = await userModel.findByIdAndUpdate(user._id, {refresh_token : refreshToken});

            //  cookie also need to be setuped
            
            return res.status(200)
                        .cookie('chatappAccessToken', accessToken , cookieOptions)
                        .cookie('chatappRefreshToken', refreshToken, cookieOptions)
                        .json(
                                new ApiResponse(
                                    200, 
                                    { data : userWithRefreshToken},
                                    "User logged in successfully"
                                )
                        );
    
        } catch (error) {
            throw new ApiError(500, "Invalid server response");
        }

    }else if(body.type === AUTH_ROLE.SDK){
        // for sdk
        if(!body.access_token?.trim() || !body.api_key?.trim()){
            throw new ApiError(400, "Both api key and access token required", ['missing api key or access token']);
        }

        // based on the access token provided from the system used with SDK, 

        // console.log("SDK", body);

        return res.status(200).json({'message': 'successfull'})
        
    }     
})


export const logout = asyncHandler(async(req, res, next) => {

})


export const preRegister = asyncHandler(async(req, res, next) => {
    const body : preLocalRegisterBody = req?.body;

    if(body.type !== AUTH_ROLE.NORMAL){
        throw new ApiError(400, "Invalid registration type");
    }

    if(!body.phone_number){
        throw new ApiError(400, "phone number is required");
    }

    try {
        const isUser = await userModel.findOne({phone_number : body.phone_number});

        if(isUser){
            throw new ApiError(400, "user already exists");
        }

        return res.status(200).json(new ApiResponse(200, {
            isUser : false,
            otpVerified : false
        }, "pre-registration successfull..."));
    } catch (error) {
        throw new ApiError(500, "Internal server error");
    }
})



export const register = asyncHandler(async(req, res, next) => {

    const body : registerBody = req?.body;


    if(body.type !== AUTH_ROLE.NORMAL && body.type !== AUTH_ROLE.SDK){
        throw new ApiError(400, "Invalid registration request", [`Invalid registration request type`])
    }

    if(body.type === AUTH_ROLE.NORMAL){
        // stpes for registrating normal user
         
    }else if(body.type === AUTH_ROLE.SDK){
        throw new ApiError(400, "Cannot register SDK User currently...", [`SDK user registration request`]);
        
    }

    
})


