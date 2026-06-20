import {Schema, model} from "mongoose";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from 'jsonwebtoken'
import { IUserMethods, UserModel, IUserDocument,USER_ROLE } from "@repo/types";


const userSchema = new Schema<IUserDocument, UserModel, IUserMethods>({
   
    full_name : {
        type : String,
        required : false, 
        lowercase : true,
        trim : true
    },
    phone_number : {
        type : String,
        required : [true, 'phone number is required'],
        validate : {
            validator : function(v : string){
                return v.length >= 8
            }, 
            message : "Invalid phone number length"
        },
        index : true,
    }, 
    type : {
        type : String,
        enum : USER_ROLE,
        default : USER_ROLE.NORMAL,
        required : true
    }, 
    tenant_id : {
        type : Schema.Types.ObjectId,
        ref : "Tenant",
        default : null
    }, 
    email : {
        type : String,
        required : false,
        default : null,
        validate : {
            validator : function (n:String) {
            if(!n) return true;
            return  n?.includes('@') ? true : false
        },
        message : `Invalid email type`
    }

    }, 
    avatar : {
        type : String,
        required : false,

    }, 
    hashed_password : {
        type : String,
        required : [true, "password is required"]
    },
    refresh_token : {
        type : String
    }, 
    last_logged_in : {
        type : Date,
        required : true,
        default : Date.now 
    }

}, 
{
    timestamps : true
}
)

//During db call:save, if the password has been change then only rehash the password , if not no need to do
userSchema.pre('save',async function () {
    if(!this.isModified('hashed_password'))return;
    this.hashed_password =await bcrypt.hash(this.hashed_password, 10)
    return
});

// compare passwords
userSchema.methods.isPasswordCorrect = async function(password : string) : Promise<boolean> {
    return await bcrypt.compare(password, this.hashed_password)
}

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        //payload
        {
            id : this._id,
            phone_number : this.phone_number.toString(),
            tenant_id : this.tenant_id
        },
        //access token key 
        process.env.ACCESS_TOKEN_SECRET! as string ,

        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY! as SignOptions['expiresIn']
        }

    )
}

userSchema.methods.generateRefreshToken =  function() {
    return  jwt.sign(
    {
        id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY! as SignOptions['expiresIn']
    }
)
}


export const userModel = model<IUserDocument, UserModel>('User', userSchema)

