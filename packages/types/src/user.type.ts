import { USER_ROLE_TYPE} from "./roles.type";
import { Types , HydratedDocument, Model} from "mongoose";


export interface IUser{
    id? : string;
    full_name? : string | null; 
    phone_number : string;
    type : USER_ROLE_TYPE; //defines type of user : normal or tenant
    avatar? : string | null;
    tenant_id? : string | null
    email? : string;
    hashed_password : string;
    refresh_token : string;
    last_logged_in : Date;
    createdAt : Date;
    updatedAt : Date;

}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;

    generateAccessToken(): string;

    generateRefreshToken(): string;
}

export interface IUserDocument extends Omit<IUser, "id" | "tenant_id" > {
    _id : Types.ObjectId,
    tenant_id? : Types.ObjectId | null,
    
}

export type UserDocument = HydratedDocument<IUserDocument, IUserMethods>

export type UserModel = Model<IUserDocument, {}, IUserMethods>








