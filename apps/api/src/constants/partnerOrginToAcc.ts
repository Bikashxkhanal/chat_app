


export function partnerOriginToAcc(): {[key : string] : string}{
    return (
        {
    "http://api.kds.com/" : process.env.KDS_ACCESS_TOKEN_SECRET!,
    "efg.com" : process.env.APOLLO_ACCESS_TOKEN_SECRET!

        }

    )
}