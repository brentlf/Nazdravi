import { useState } from "react";
import { MessageCircle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Message, User as UserType } from "@/types";
import { orderBy, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface AdminConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  onBack: () => void;
}

export function AdminConversationList({ onSelectConversation, onBack }: AdminConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { update: updateMessage } = useFirestoreActions("messages");

  // Fetch all messages to build conversation list
  const { data: allMessages, loading: messagesLoading } = useFirestoreCollection<Message>(
    "messages",
    [orderBy("createdAt", "desc")]
  );

  // Fetch all users for conversation partners
  const { data: users, loading: usersLoading } = useFirestoreCollection<UserType>("users", [
    where("role", "==", "client")
  ]);

  // Build conversation list from messages
  const conversations = allMessages?.reduce((acc, message) => {
    if (!user) return acc;
    
    // Determine the client user (non-admin)
    const clientUserId = message.fromUser === "admin" || message.fromUser === user.uid ? message.toUser : message.fromUser;
    const clientUser = users?.find(u => u.uid === clientUserId);
    
    if (!clientUser || clientUserId === "admin" || clientUserId === user.uid) return acc;
    
    // Create conversation ID
    const conversationId = `${clientUserId}_admin`;
    
    if (!acc[conversationId]) {
      acc[conversationId] = {
        id: conversationId,
        clientUser,
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
    
    // Count unread messages from client to admin
    if (message.fromUser === clientUserId && (message.read === false || message.read === undefined)) {
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
    conv.clientUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.clientUser.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border text-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">Admin Messages</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
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
                className="px-3 py-2 border-b border-border/30 cursor-pointer hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conversation.clientUser.photoURL} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {conversation.clientUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                        <span className="text-xs text-destructive-foreground font-bold">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conversation.clientUser.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.lastMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Clients will appear here when they start messaging</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
