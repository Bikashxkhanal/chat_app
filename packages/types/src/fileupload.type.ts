
/**
 * The shared package is also consumed by browser SDKs, so it must not expose
 * Express/Multer globals.  This is the small subset the API needs after
 * Multer has written a file to disk.
 */
export interface uploadProfilePicture {
    [profilePicture: string]: Array<{ path: string }>;
}


export type files = uploadProfilePicture
