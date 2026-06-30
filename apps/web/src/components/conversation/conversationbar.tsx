import { useState } from "react";
import ConversationHeader from "./header.conversation";
import ConversationList from "./list.conversation";
import { useChat } from "../../context/chatContext";
import NewChatModal from "./new.chat.modal";
import CreateGroupModal from "./create.group.modal";

const ConversationBar = () => {
  const { conversations, isLoadingConversations, selectChat } = useChat();
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0 w-full bg-[var(--surface)] mobile-list-pad">
        <ConversationHeader
          onNewChat={() => setShowNewChat(true)}
          onNewGroup={() => setShowNewGroup(true)}
        />

        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoadingConversations ? (
            <p className="text-center text-[var(--fg-muted)] text-sm py-8">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-center text-[var(--fg-muted)] text-sm py-8 px-4">
              No conversations yet
            </p>
          ) : (
            <ConversationList
              conversationList={conversations}
              onSelect={(card) => {
                if (!card.conversationId) return;
                selectChat({
                  conversationId: card.conversationId,
                  userId: card.isGroup ? undefined : card.userId,
                  groupId: card.groupId,
                  isGroup: card.isGroup,
                  full_name: card.full_name,
                  avatar: card.avatar,
                });
              }}
            />
          )}
        </div>
      </div>

      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
      <CreateGroupModal open={showNewGroup} onClose={() => setShowNewGroup(false)} />
    </>
  );
};

export default ConversationBar;
