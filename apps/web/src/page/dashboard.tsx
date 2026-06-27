import Sidebar from "../components/dashboard/sidebar";
import ConversationBar from "../components/conversation/conversationbar";
import DefaultMessageUI from "../components/conversation/message.default.ui";

const DashboardPage = () => {
    return (
        <>
        <div className="min-w-screen h-full md:flex md:flex-row ">
            {/* sidebar for Navigation ICons */}
            <Sidebar />

            {/* conversation Bar for showing conversations */}
            <ConversationBar />

            {/* message box to display messages */}
            <DefaultMessageUI />
        </div>
        </>
    )
}

export default DashboardPage;