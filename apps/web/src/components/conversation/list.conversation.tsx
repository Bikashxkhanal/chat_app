import type { UserCardProps } from "@repo/types"
import { UserCard } from "../common/usercard"


// this function will return the list of usercards to show on the conversation list

interface ConversationListProps { 
    conversationList : UserCardProps[]
    onSelect?: (card: UserCardProps) => void
}

function ConversationList({
    conversationList,
    onSelect
} : ConversationListProps) {
    return(
        <>
        <div className="
        w-full mx-auto 
        md:w-full md:pt-4   
        ">{
            conversationList.map((eachConv, idx) =>(
               <UserCard
                 key={eachConv.conversationId ?? idx}
                 {...eachConv}
                 onClick={() => onSelect?.(eachConv)}
               />
            ) )
        }

        </div>
        </>
    )
    
}
export default ConversationList