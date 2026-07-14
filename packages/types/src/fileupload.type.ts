
export interface uploadProfilePicture { 
    [profilePicture : string] : Express.Multer.File[] 
}


export type files = uploadProfilePicture