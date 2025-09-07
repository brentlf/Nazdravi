import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, User, Clock, ArrowLeft, MoreVertical } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminConversationList } from "@/components/admin/AdminConversationList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Message, User as UserType } from "@/types";
import { orderBy, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users for chat selection
  const { data: users, loading: usersLoading } = useFirestoreCollection<UserType>("users", [
    where("role", "==", "client")
  ]);

  // Simple approach: Get all messages and filter them
  const { data: allMessages, loading: messagesLoading } = useFirestoreCollection<Message>(
    "messages",
    [orderBy("createdAt", "asc")]
  );

  // Filter messages for the selected conversation
  const messages = allMessages?.filter(message => {
    if (!selectedConversation || !user) return false;
    
    // Extract client user ID from conversation ID (format: clientUserId_admin)
    const clientUserId = selectedConversation.replace('_admin', '');
    
    // Check if message belongs to this conversation
    const isFromConversation = (
      message.chatRoom === selectedConversation ||
      (message.fromUser === user.uid && message.toUser === clientUserId) ||
      (message.fromUser === clientUserId && message.toUser === user.uid) ||
      (message.fromUser === "admin" && message.toUser === clientUserId) ||
      (message.fromUser === clientUserId && message.toUser === "admin")
    );
    
    return isFromConversation;
  }) || [];

  console.log('Final filtered messages:', messages.length, 'out of', allMessages?.length || 0);

  const { add: addMessage, update: updateMessage, loading: sendingMessage } = useFirestoreActions("messages");

  // Mark messages as read when admin views them
  useEffect(() => {
    if (messages && selectedConversation && updateMessage) {
      const unreadMessagesToAdmin = messages.filter(msg => 
        msg.toUser === "admin" && (msg.read === false || msg.read === undefined)
      );
      
      unreadMessagesToAdmin.forEach(async (message) => {
        try {
          await updateMessage(message.id, { read: true });
        } catch (error) {
          console.error('Failed to mark admin message as read:', error);
        }
      });
    }
  }, [messages, selectedConversation, updateMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Filter users based on search
  const filteredUsers = users?.filter(u => 
    !searchTerm || 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      // Extract client user ID from conversation ID
      const clientUserId = selectedConversation.replace('_admin', '');
      
      await addMessage({
        fromUser: "admin", // Always use "admin" for consistency across admin accounts
        toUser: clientUserId,
        text: newMessage,
        chatRoom: selectedConversation, // Use the conversation ID
        createdAt: new Date(),
        read: false,
        messageType: "text"
      });

      // Send email notification to client
      try {
        const response = await fetch('/api/emails/message-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromUserId: "admin",
            toUserId: clientUserId,
            messageType: "General",
            urgency: "Medium",
            content: newMessage
          }),
        });
        
        if (response.ok) {
          console.log('Client notification sent successfully');
        } else {
          console.error('Failed to send client notification');
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the message sending if email notification fails
      }

      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };


  if (usersLoading) {
    return (
      <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
        <AdminConversationList 
          onSelectConversation={handleSelectConversation}
          onBack={() => window.history.back()}
        />
      </div>
    );
  }

  // Get the client user from the conversation ID
  const clientUserId = selectedConversation.replace('_admin', '');
  const selectedClient = users?.find(u => u.uid === clientUserId);

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
              <AvatarImage src={selectedClient?.photoURL} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                <span className="text-sm">{selectedClient?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground truncate text-sm leading-none">{selectedClient?.name || 'Client'}</h1>
              <p className="text-xs text-muted-foreground truncate leading-none" style={{ marginTop: '1px' }}>{selectedClient?.email || 'client@example.com'}</p>
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
                  <ScrollArea className="h-full px-4 py-2">
          <div className="space-y-1 pb-2">
            {messagesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-10 bg-white/20 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((message, index) => {
                const isFromAdmin = message.fromUser === "admin" || message.fromUser === user?.uid;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showTime = !prevMessage || 
                  Math.abs(new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 5 * 60 * 1000; // 5 minutes
                
                return (
                  <div key={message.id}>
                    {/* Time separator */}
                    {showTime && (
                      <div className="flex justify-center my-4">
                        <div className="bg-black/10 dark:bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
                          {(() => {
                            try {
                              let date;
                              if (message.createdAt instanceof Date) {
                                date = message.createdAt;
                              } else if (message.createdAt && typeof message.createdAt === 'object' && 'toDate' in message.createdAt) {
                                date = (message.createdAt as any).toDate();
                              } else {
                                date = new Date();
                              }
                              return date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            } catch (error) {
                              return 'Just now';
                            }
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex gap-1.5 ${isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                      {/* Client Avatar */}
                      {!isFromAdmin && (
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage src={selectedClient?.photoURL} />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {selectedClient?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      {/* Spacer for admin messages */}
                      {isFromAdmin && <div className="w-6" />}
                      
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg ${
                          isFromAdmin
                            ? 'bg-green-500 text-white rounded-br-sm'
                            : 'bg-blue-500 text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-tight">{message.text}</p>
                        <p
                          className={`text-xs ${
                            isFromAdmin 
                              ? 'text-green-100' 
                              : 'text-blue-100'
                          }`}
                        >
                          {(() => {
                            try {
                              let date;
                              if (message.createdAt instanceof Date) {
                                date = message.createdAt;
                              } else if (message.createdAt && typeof message.createdAt === 'object' && 'toDate' in message.createdAt) {
                                date = (message.createdAt as any).toDate();
                              } else {
                                date = new Date();
                              }
                              return date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            } catch (error) {
                              return 'Just now';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-foreground font-medium mb-2">Start a conversation</h3>
                <p className="text-muted-foreground text-sm">
                  Send a message to {selectedClient?.name}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
                </div>

        {/* Clean Input Area */}
        <div className="bg-card border-t border-border px-4 py-2 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Message Input */}
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="py-2 px-4 rounded-full border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[36px] max-h-[80px] text-sm placeholder:text-muted-foreground"
              />
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              size="icon"
              className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}