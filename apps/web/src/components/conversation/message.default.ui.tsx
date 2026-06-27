import {MessageSquarePlusIcon } from 'lucide-react'

interface CreateMessage {
    handleCreateNewConversation? : (e : React.MouseEvent<HTMLDivElement>) => void
}

const DefaultMessageUI = ({
    handleCreateNewConversation
} : CreateMessage ) => {
    return(
        <>
        <div className="
        fixed bottom-30 right-10
        md:static flex-1 md:h-screen md:flex md:flex-row md:justify-center md:items-center cursor-pointer"
         onClick={(e) => handleCreateNewConversation(e)}>     
            <div className=' border p-4 md:p-8 rounded-2xl bg-[#32CD32] border-[#32CD32]' >
                <MessageSquarePlusIcon size={34} color='#32CD32' fill='white' />
            </div>
        </div>
        </>
    )
}

export default DefaultMessageUI;