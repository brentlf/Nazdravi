import { useState, useEffect } from "react";
import { MessageCircle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Message, User as UserType } from "@/types";
import { where, orderBy } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  onBack: () => void;
  selectedConversation?: string | null;
}

export function ConversationList({ onSelectConversation, onBack, selectedConversation }: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { effectiveUser: user } = useAuth();
  const { update: updateMessage } = useFirestoreActions("messages");

  // Fetch all messages to build conversation list
  const { data: allMessages, loading: messagesLoading } = useFirestoreCollection<Message>(
    "messages",
    [orderBy("createdAt", "desc")]
  );

  // Fetch all users for conversation partners
  const { data: users, loading: usersLoading } = useFirestoreCollection<UserType>("users");

  // Build conversation list from messages
  const conversations = allMessages?.reduce((acc, message) => {
    if (!user) return acc;
    
    // Determine the other participant
    const otherUserId = message.fromUser === user.uid ? message.toUser : message.fromUser;
    const otherUser = users?.find(u => u.uid === otherUserId);
    
    if (!otherUser || otherUserId === user.uid) return acc;
    
    // Create conversation ID to match message chatRoom format
    const conversationId = message.chatRoom || `${otherUserId}_admin`;
    
    if (!acc[conversationId]) {
      acc[conversationId] = {
        id: conversationId,
        otherUser,
        lastMessage: message,
        unreadCount: 0,
        messages: []
      };
    }
    
    // Add message to conversation
    acc[conversationId].messages.push(message);
    
    // Update last message if this one is newer
    if (new Date(message.createdAt) > new Date(acc[conversationId].lastMessage.createdAt)) {
      acc[conversationId].lastMessage = message;
    }
    
    // Count unread messages
    if (message.toUser === user.uid && (message.read === false || message.read === undefined)) {
      acc[conversationId].unreadCount++;
    }
    
    return acc;
  }, {} as Record<string, any>) || {};

  const conversationList = Object.values(conversations).sort((a: any, b: any) => 
    new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  // Filter conversations based on search
  const filteredConversations = conversationList.filter((conv: any) => 
    !searchTerm || 
    conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return "";
    
    try {
      let date;
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return "";
      }
      
      if (isNaN(date.getTime())) return "";
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    } catch (error) {
      return "";
    }
  };

  if (messagesLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground mb-2">Loading conversations...</div>
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border text-foreground px-4 py-3 flex items-center justify-between flex-shrink-0 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0 sm:hidden" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground text-lg sm:text-xl">Messages</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border sm:p-4 sm:pb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground sm:left-4 sm:top-4 sm:h-5 sm:w-5" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 sm:h-12 sm:text-base"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation: any) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`px-3 py-3 border-b border-border/30 cursor-pointer hover:bg-muted transition-colors sm:px-6 sm:py-4 ${
                  selectedConversation === conversation.id 
                    ? 'bg-primary/10 border-l-4 border-l-primary shadow-sm ring-1 ring-primary/20' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={conversation.otherUser.photoURL} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation.otherUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center sm:w-6 sm:h-6">
                        <span className="text-xs text-destructive-foreground font-bold sm:text-sm">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate sm:text-base">{conversation.otherUser.name}</p>
                        {selectedConversation === conversation.id && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground sm:text-sm">
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate sm:text-sm sm:mt-1">
                      {conversation.lastMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground sm:p-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50 sm:w-16 sm:h-16 sm:mb-6" />
              <p className="text-base sm:text-lg">No conversations yet</p>
              <p className="text-sm sm:text-base mt-1">Start a conversation with your nutritionist</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
