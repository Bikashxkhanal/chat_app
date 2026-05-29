
type cookieSameSite = "none" | "strict" | "lax"

export const cookieOptions : {secure : boolean, httpOnly : boolean, sameSite : cookieSameSite} = {
    secure : true,
    httpOnly : true,
    sameSite : "none", 
};




