import { ApiError } from '@repo/utils'
import {v2 as cloudinary }  from 'cloudinary'
import fs from 'fs'



cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME!,
    api_key : process.env.CLOUDINARY_API_KEY!,
    api_secret : process.env.CLOUDINARY_API_SECRET!,
  
})

console.log(cloudinary.config());






export const uploadOnCloudinary = async (localFilePath : string) => {
    try {
        
        if(!localFilePath) return null
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        }).catch((error : any) => 
                {
                    console.log(error)
                    throw error 
                })
        fs.unlinkSync(localFilePath)
        return uploadResult
    } catch (error : any) {
        fs.unlinkSync(localFilePath)
        console.log(error);
       throw new ApiError(401, error.message)
        
    }
}



