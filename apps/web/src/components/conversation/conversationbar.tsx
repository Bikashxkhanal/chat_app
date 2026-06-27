import ConversationHeader from "./header.conversation";
import ConversationList from "./list.conversation";
import type { UserCardProps } from "@repo/types";



const seedCOnversationListData : UserCardProps[] = [
    {
        full_name : "Bikash Khanal",
        avatar : null,
        lastMessage : "Hi, there",
        messageStatus : "received_unseen",
        timestamp : "10:30"
        
    },
    {
        full_name : "Bikash Khanal",
        avatar : null,
        lastMessage : "Hi, there",
        messageStatus : "received_unseen",
        timestamp : "02:30"
        
    },
    {
        full_name : "Bikash Khanal",
        avatar : null,
        lastMessage : "Hi, there",
        messageStatus : "sent",
        timestamp : "04:30"
        
    }
    ,{
        full_name : "Bikash Khanal",
        avatar : null,
        lastMessage : "Hi, there",
        messageStatus : "received_seen",
        timestamp : "06:30"
        
    }
]


const ConversationBar = () => {

    return (
        <>
        <div className="
        w-screen
        md:w-100
        shrink-0
        min-h-screen md:left-20 md:top-0 
        md:px-4 md:border-r 
        
        ">
            {
                <ConversationHeader />
            }

            {
                <ConversationList conversationList={seedCOnversationListData} />
            }
            


        </div>
        </>
    )
}

export default ConversationBar