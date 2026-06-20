import api from "./axios";
import { ApiError } from "@repo/utils";


// request interceptor
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        // adding timeout for the request
        if(config.timeout){
            config.timeout = 10000;
        }

        return config
    }, 
    (error) => {
        return Promise.reject(error);
    }


)

// response interceptor 
api.interceptors.response.use(
    (response ) => response.data 

)


// error response interceptor

api.interceptors.response.use(
    (error : unknown) => { 
        console.log("inside error interceptor");
        
        if( error instanceof ApiError){
            const statusCode = error.statusCode;
            const message = error.message;
            const data = error.data;

            return Promise.reject({
            statusCode,
            message,
            data
        });

        }

        return Promise.reject(error);

    }
)