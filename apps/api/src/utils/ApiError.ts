export class ApiError extends Error{
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

    }
}