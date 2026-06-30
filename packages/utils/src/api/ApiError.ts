import type { ApiErrorResponseInterface } from "../../../types/src/api.type";

export class ApiError extends Error implements ApiErrorResponseInterface{
    statusCode : number;
    errors : string[];
    data :null;
    success : boolean 
    constructor(
        statusCode : number ,
        message : string = "something went wrong",
        errors : string[] = []
    ){
       super(message);
       this.statusCode = statusCode;
       this.errors = errors;
       this.data = null;
       this.success = false

       Object.setPrototypeOf(this, ApiError.prototype);

    }
}