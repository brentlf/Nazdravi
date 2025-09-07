import { useState } from "react";
import { ConversationList } from "@/components/dashboard/ConversationList";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { User as UserType } from "@/types";
import { where } from "firebase/firestore";

export default function DashboardMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { effectiveUser: user } = useAuth();

  // Get the other user in the conversation
  const { data: users } = useFirestoreCollection<UserType>("users");
  const otherUserId = selectedConversation ? selectedConversation.replace('_admin', '') : null;
  const otherUser = users?.find(u => u.uid === otherUserId);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // Clean unified chat layout
  return (
    <div className="chat-container">
      {/* Conversation Sidebar - Always visible on desktop, conditional on mobile */}
      <div className={`${selectedConversation ? 'hidden sm:block' : 'block'} conversation-sidebar`}>
        <ConversationList 
          onSelectConversation={handleSelectConversation}
          onBack={() => window.history.back()}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Chat Main Area - Hidden on mobile when no selection, always visible on desktop */}
      <div className={`${selectedConversation ? 'block' : 'hidden sm:block'} chat-main`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="px-4 py-2 flex items-center justify-start gap-3 h-full sm:px-6 sm:py-3">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9 p-0 rounded-full sm:hidden" onClick={handleBackToConversations}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <Avatar className="h-11 w-11 ring-2 ring-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 shadow-md sm:h-12 sm:w-12">
                  <AvatarImage src={otherUser?.photoURL} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    <span className="text-sm sm:text-base">{otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h1 className="font-semibold text-foreground truncate text-sm leading-tight sm:text-base sm:leading-normal">{otherUser?.name || 'Nutritionist'}</h1>
                  <p className="text-xs text-muted-foreground truncate leading-tight sm:text-sm sm:leading-normal" style={{ marginTop: '2px' }}>{otherUser?.email || 'nutritionist@example.com'}</p>
                </div>
                
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages">
              <MessageThread conversationId={selectedConversation} />
            </div>
          </>
        ) : (
          /* Desktop fallback when no conversation selected */
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
