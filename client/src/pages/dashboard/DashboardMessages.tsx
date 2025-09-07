import { useState } from "react";
import { ConversationList } from "@/components/dashboard/ConversationList";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
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
  const otherUserId = selectedConversation ? selectedConversation.split('_').find(id => id !== user?.uid) : null;
  const otherUser = users?.find(u => u.uid === otherUserId);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // If no conversation is selected, show conversation list
  if (!selectedConversation) {
    return (
      <div className="h-screen bg-background overflow-hidden">
        <ConversationList 
          onSelectConversation={handleSelectConversation}
          onBack={() => window.history.back()}
        />
      </div>
    );
  }

  // Show individual conversation
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden chat-page-container">
      {/* Fixed Combined Header */}
      <div className="chat-header-main text-foreground shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9 p-0 rounded-full" onClick={handleBackToConversations}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Avatar className="h-11 w-11 ring-2 ring-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
              <AvatarImage src={otherUser?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                <span className="text-sm">{otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate text-sm leading-none">{otherUser?.name || 'Nutritionist'}</h1>
              <p className="text-xs text-muted-foreground truncate leading-none" style={{ marginTop: '0px' }}>{otherUser?.email || 'nutritionist@example.com'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9 p-0 rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Background */}
      <div className="flex-1 bg-muted/30 relative overflow-hidden chat-messages-container">
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Messages Container */}
        <div className="relative z-10 h-full chat-message-thread">
          <MessageThread conversationId={selectedConversation} />
        </div>
      </div>
    </div>
  );
}
