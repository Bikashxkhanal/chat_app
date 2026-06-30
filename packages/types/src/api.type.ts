
// shared types for Api response 
export interface ApiSuccessResponseInterface{
     statusCode : number;
    data : object;
    message : string;
    success : boolean;
}

// for error response 
export interface ApiErrorResponseInterface{
    statusCode : number;
    errors : string[];
    data :null;
    success : boolean;
    message : string;
}