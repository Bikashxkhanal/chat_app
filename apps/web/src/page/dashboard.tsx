import Sidebar from "../components/dashboard/sidebar";
import ConversationBar from "../components/conversation/conversationbar";
import DefaultMessageUI from "../components/conversation/message.default.ui";
import ChatWindow from "../components/conversation/chat.window";
import { ChatProvider, useChat } from "../context/chatContext";

function DashboardContent() {
  const { selectedChat, closeChat } = useChat();
  const inChat = Boolean(selectedChat);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row overflow-hidden bg-[var(--bg)]">
      <Sidebar inChat={inChat} />

      {/* Conversation list — full screen on mobile when no chat is open */}
      <div
        className={`flex flex-col flex-1 min-h-0 min-w-0 md:max-w-sm md:border-r border-[var(--border)] ${
          inChat ? "hidden md:flex" : "flex"
        }`}
      >
        <ConversationBar />
      </div>

      {/* Chat — full screen on mobile when open */}
      {inChat ? (
        <div className="flex flex-1 min-h-0 min-w-0 fixed inset-0 z-20 md:relative md:z-auto bg-[var(--bg)]">
          <ChatWindow onBack={closeChat} />
        </div>
      ) : (
        <DefaultMessageUI />
      )}
    </div>
  );
}

const DashboardPage = () => {
  return (
    <ChatProvider>
      <DashboardContent />
    </ChatProvider>
  );
};

export default DashboardPage;
