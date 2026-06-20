export class ApiResponse {
    statusCode : number;
    data : object;
    message : string;
    success : boolean;
    constructor(
        statusCode : number,
        data : object = {}, 
        message : string = "sucess"
    ){
        this.statusCode = statusCode
        this.data = data
        this.message = message 
        this.success = statusCode >= 200 && statusCode < 300
    }
}