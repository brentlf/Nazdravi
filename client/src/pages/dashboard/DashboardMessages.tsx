import { useState } from "react";
import { ConversationList } from "@/components/dashboard/ConversationList";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
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
      <div className="h-screen bg-background">
        <ConversationList 
          onSelectConversation={handleSelectConversation}
          onBack={() => window.history.back()}
        />
      </div>
    );
  }

  // Show individual conversation
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="bg-card border-b border-border text-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0" onClick={handleBackToConversations}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.photoURL} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <span className="text-sm font-medium">{otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">{otherUser?.name || 'Nutritionist'}</h1>
            <p className="text-xs text-muted-foreground truncate">Online</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Background */}
      <div className="flex-1 bg-muted/30 relative overflow-hidden">
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Messages Container */}
        <div className="relative z-10 h-full">
          <MessageThread conversationId={selectedConversation} />
        </div>
      </div>
    </div>
  );
}
