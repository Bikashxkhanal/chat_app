import type { AxiosResponse } from "axios"
import type { ApiSuccessResponseInterface } from "@repo/types"

// utitlity function to handle the api Requests with loading state, success and error
export const requestHandler = async(
    api : () => Promise<AxiosResponse<ApiSuccessResponseInterface, any>>,
    setLoading : ((loading : boolean) => void) | null,
    onSuccess : (data : ApiSuccessResponseInterface) => void,
    onError : (errors : string) => void
) => {
    setLoading && setLoading(true)

    try {
        const response = await api();
        if(response.data.success){
            onSuccess(response.data);
        }


    } catch (error : any) {
        // handling unauthorized access
        if([401, 403].includes(error.response.data.statusCode)){
            // clean the localstorage:userCreds, tokens etc
            window.location.href = "/login"
        }

        onError(error?.response?.data?.message || `Something went wrong`);
    } finally {
       setLoading && setLoading(false);
    }
}

export class LocalStorage {
    static get(key : string){
        if(typeof window == "undefined") return;
        const value = localStorage.getItem(key);
        if(!value) return null;
        return JSON.parse(value);
    } 

    // setting the data in localstorage
    static set(key : string , value : any){
        try {
            if(typeof window == 'undefined')return;
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            return null;
        }
    }

    static remove(key: string){
     
            if(typeof window == "undefined")return;
            localStorage.removeItem(key);
 
    }

    static clear(){
        if(typeof window == "undefined")return;
        localStorage.clear();
    }
}