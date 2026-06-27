import type { UserCardProps } from "@repo/types"
import { UserCard } from "../common/usercard"


// this function will return the list of usercards to show on the conversation list

interface ConversationListProps { 
    conversationList : UserCardProps[]
}

function ConversationList({
    conversationList
} : ConversationListProps) {
    return(
        <>
        <div className="
        w-full mx-auto 
        md:w-full md:pt-4   
        ">{
            conversationList.map((eachConv, idx) =>(
               <UserCard key={idx} {...eachConv} />
            ) )
        }

        </div>
        </>
    )
    
}
export default ConversationList