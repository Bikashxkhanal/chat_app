import { ApiError, ApiResponse } from "@repo/utils";
import { asyncHandler } from "../../utils";
import { loginBody , AUTH_ROLE, registerBody, preLocalRegisterBody, partnerUserInfoInTokenType} from "@repo/types";
import { userModel } from "@repo/db-nosql";
import { cookieOptions } from "../../constants/index";


export const login = asyncHandler(async (req, res, next) => {
       const body : loginBody = req?.body;
       
    //    console.log(body);
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
            throw new ApiError(401, "Both phone number and password is required", ['missing phone number or password']);
        }     

            const user = await userModel.findOne({
                    phone_number : body.phone_number
            });

            // if user doesnot exists
            if(!user){
                throw new ApiError(401, "User with such phone number doesnot exists");
            }
            
            // normal user cannot contain tenant id
            if(user?.tenant_id){
                throw new ApiError(401, "User type didnot matched");
            }

            // comparing password
          const isPasswordCorrect = await user.isPasswordCorrect(body.password?.trim());
    
            // if incorrect , exit
          if(!isPasswordCorrect){
            throw new ApiError(401, "Incorrect password");
          }

        //   if the password is correct, then generate , refresh and acess tokens 

         const accessToken = user.generateAccessToken();
         const refreshToken = user.generateRefreshToken();

         const userWithRefreshToken = await userModel.findByIdAndUpdate(user._id, {refresh_token : refreshToken}, {new : true}).select("--hashed_password");

            //  cookie also need to be setuped
            
            return res.status(200)
                        .cookie('chatappAccessToken', accessToken , cookieOptions)
                        .cookie('chatappRefreshToken', refreshToken, cookieOptions)
                        .json(
                                new ApiResponse(
                                    200, 
                                    { user : userWithRefreshToken},
                                    "User logged in successfully"
                                )
                        );
    
       

    }else if(body.type === AUTH_ROLE.SDK){
      const partnerUser : partnerUserInfoInTokenType = req?.partnerUser!;
      console.log(partnerUser);
      
      const { api_key, access_token_secret, name, tenant_id } = req?.partner;
      console.log(tenant_id);
      

      const user = await userModel.findOne({
        phone_number :  partnerUser.phone_number!,
        
      })
    //   console.log(user);
      
      if(!user) throw new ApiError(401, "invalid request, user doesnot exist");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const finalUser = await userModel.findByIdAndUpdate(user._id, {refresh_token : refreshToken}, {new : true}).select("--hashed_password").lean();
    
    
        return res.status(200)
        .cookie("chatappAccessToken", accessToken, cookieOptions)
        .cookie("chatappRefreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                {
                    user : {
                        ...finalUser,
                        phone_number : finalUser?.phone_number.toString()
                    }
                }, 
                "user logged in successfully!"
            )
        )
        
    }     
})


export const logout = asyncHandler(async(req, res, next) => {

})


export const preRegister = asyncHandler(async(req, res, next) => {
    const body : preLocalRegisterBody = req?.body;

    if(body.type !== AUTH_ROLE.NORMAL){
        throw new ApiError(401, "Invalid registration type");
    }

    if(!body.phone_number){
        throw new ApiError(401, "phone number is required");
    }

    try {
        const isUser = await userModel.findOne({phone_number : body.phone_number});
        // console.log(isUser);
        
        if(isUser && isUser.tenant_id === null){
            throw new ApiError(401, "user already exists");
        }
        console.log("After throwing erro");
        

        return res.status(200)
                .json(new ApiResponse(200, {
                        isUser : false,
                        otpVerified : false
                    }, "pre-registration successfull..."));
                } catch (error : any) {
                    throw new ApiError(401, error.message);
                }
})



export const register = asyncHandler(async(req, res, next) => {

    const body : registerBody = req?.body;


    if(body.type !== AUTH_ROLE.NORMAL && body.type !== AUTH_ROLE.SDK){
        throw new ApiError(401, "Invalid registration request", [`Invalid registration request type`])
    }

    if(body.type === AUTH_ROLE.NORMAL){
        // stpes for registrating normal user

    if(body.password !== body.confirm_password) throw new ApiError(401, "confirm password didnot matched");


    try {

        const isUser = await userModel.findOne({phone_number : body.phone_number});

        if(isUser && !isUser.tenant_id){
            throw new ApiError(400, "user already exists");
        }


        const user = await userModel.create({
           phone_number : body.phone_number ,
           hashed_password : body.password
    
        });

        return res.status(200).json(
        new ApiResponse(
            200, 
            user,
            "user created successfully"
        )
    );
    
    } catch (error : any) {
         throw new ApiError(500,error?.message);
    }
         
    }else if(body.type === AUTH_ROLE.SDK){
        throw new ApiError(400, "Cannot register SDK User currently...", [`SDK user registration request`]);
        
    }

    
})


