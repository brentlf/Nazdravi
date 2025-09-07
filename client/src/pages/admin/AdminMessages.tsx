import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, User, Clock, ArrowLeft, MoreVertical, Phone, Video, Smile, Paperclip, Mic } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [selectedChatRoom, setSelectedChatRoom] = useState<string>("");
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

  // Filter messages for the selected chat room
  const messages = allMessages?.filter(message => {
    if (!selectedChatRoom || !user) return false;
    
    // Extract client user ID from selected chat room
    const clientUserId = selectedChatRoom.replace(`${user.uid}_`, "").replace(`_${user.uid}`, "");
    
    // Check multiple possible chat room formats
    const possibleChatRooms = [
      selectedChatRoom, // e.g., "client_admin"
      `${clientUserId}_admin`, // Legacy format with "admin"
      `admin_${clientUserId}`, // Reverse order with "admin"
      `${clientUserId}_${user.uid}`, // Current format
      `${user.uid}_${clientUserId}` // Reverse current format
    ];
    
    // Check if message belongs to any of these chat rooms
    if (possibleChatRooms.includes(message.chatRoom)) {
      console.log('Message matched chat room:', {
        messageId: message.id,
        fromUser: message.fromUser,
        chatRoom: message.chatRoom,
        selectedChatRoom,
        text: message.text.substring(0, 30)
      });
      return true;
    }
    
    // Also check direct user-to-user messages (including both old and new admin formats)
    const isDirectMessage = (
      (message.fromUser === user.uid && message.toUser === clientUserId) ||
      (message.fromUser === clientUserId && message.toUser === user.uid) ||
      (message.fromUser === "admin" && message.toUser === clientUserId) ||
      (message.fromUser === clientUserId && message.toUser === "admin") ||
      (message.fromUser === user.uid && message.toUser === "admin") ||
      (message.toUser === user.uid && message.fromUser === clientUserId)
    );
    
    if (isDirectMessage) {
      console.log('Message matched direct message:', {
        messageId: message.id,
        fromUser: message.fromUser,
        toUser: message.toUser,
        text: message.text.substring(0, 30)
      });
    }
    
    return isDirectMessage;
  }) || [];

  console.log('Final filtered messages:', messages.length, 'out of', allMessages?.length || 0);

  const { add: addMessage, update: updateMessage, loading: sendingMessage } = useFirestoreActions("messages");

  // Mark messages as read when admin views them
  useEffect(() => {
    if (messages && selectedChatRoom && updateMessage) {
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
  }, [messages, selectedChatRoom, updateMessage]);

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
    if (!newMessage.trim() || !selectedChatRoom || !user) return;

    try {
      // Extract client user ID from selected chat room
      const clientUserId = selectedChatRoom.replace(`_admin`, "").replace(`admin_`, "");
      
      await addMessage({
        fromUser: "admin", // Always use "admin" for consistency across admin accounts
        toUser: clientUserId,
        text: newMessage,
        chatRoom: `${clientUserId}_admin`, // Standardized format
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

  const createChatRoom = (clientUserId: string) => {
    // Always use standardized format for admin chat rooms
    return `${clientUserId}_admin`;
  };

  const getLastMessage = (clientUserId: string) => {
    const chatRoom = createChatRoom(clientUserId);
    // Filter messages for this standardized chat room format
    const roomMessages = allMessages?.filter(m => 
      m.chatRoom === chatRoom || 
      m.chatRoom === `admin_${clientUserId}` ||
      (m.fromUser === clientUserId && m.toUser === "admin") ||
      (m.fromUser === "admin" && m.toUser === clientUserId)
    ) || [];
    return roomMessages[roomMessages.length - 1];
  };

  const getUnreadCount = (clientUserId: string) => {
    const chatRoom = createChatRoom(clientUserId);
    // Count unread messages from client to admin
    const unreadMessages = allMessages?.filter(m => 
      (m.chatRoom === chatRoom || 
       m.chatRoom === `admin_${clientUserId}` ||
       (m.fromUser === clientUserId && m.toUser === "admin")) &&
      m.fromUser === clientUserId &&
      (m.read === false || m.read === undefined)
    ) || [];
    return unreadMessages.length;
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

  const selectedClient = filteredUsers.find(u => createChatRoom(u.uid) === selectedChatRoom);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Subtle Header */}
      <div className="bg-card border-b border-border text-foreground px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted h-8 w-8 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          
          {selectedClient ? (
            <>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedClient.photoURL} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-foreground truncate">{selectedClient.name}</h1>
                <p className="text-xs text-muted-foreground truncate">{selectedClient.email}</p>
              </div>
            </>
          ) : (
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-foreground">Admin Messages</h1>
              <p className="text-xs text-muted-foreground">Select a client to start chatting</p>
            </div>
          )}
        </div>
        
        {selectedClient && (
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
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Client List Sidebar */}
        <div className="w-64 sm:w-80 bg-card border-r border-border flex flex-col">
          {/* Search Header */}
          <div className="p-2 sm:p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3.5 sm:h-4 w-3.5 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 sm:pl-9 h-8 sm:h-10 text-sm"
              />
            </div>
          </div>

          {/* Client List */}
          <ScrollArea className="flex-1">
            <div className="space-y-0 sm:space-y-0.5 p-1">
              {filteredUsers.map((client) => {
                const chatRoom = createChatRoom(client.uid);
                const lastMessage = getLastMessage(client.uid);
                const unreadCount = getUnreadCount(client.uid);
                const isSelected = selectedChatRoom === chatRoom;
                const hasUnread = unreadCount > 0;

                return (
                  <div
                    key={client.uid}
                    onClick={() => setSelectedChatRoom(chatRoom)}
                    className={`px-2 py-1.5 sm:px-3 sm:py-2 border-b border-border/30 cursor-pointer hover:bg-muted transition-colors ${
                      isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                          <AvatarImage src={client.photoURL} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-[10px] sm:text-xs">
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {hasUnread && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-destructive rounded-full flex items-center justify-center">
                            <span className="text-[8px] sm:text-[10px] text-destructive-foreground font-bold">{unreadCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-[11px] sm:text-xs truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}>
                            {client.name.length > 10 ? `${client.name.substring(0, 10)}...` : client.name}
                          </p>
                          {lastMessage && (
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-1 flex-shrink-0">
                              {(() => {
                                try {
                                  let date;
                                  if (lastMessage.createdAt instanceof Date) {
                                    date = lastMessage.createdAt;
                                  } else if (lastMessage.createdAt && typeof lastMessage.createdAt === 'object' && 'toDate' in lastMessage.createdAt) {
                                    date = (lastMessage.createdAt as any).toDate();
                                  } else {
                                    date = new Date();
                                  }
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
                                  return 'now';
                                }
                              })()}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                            {lastMessage.text.length > 20 ? `${lastMessage.text.substring(0, 20)}...` : lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No clients found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChatRoom ? (
            <>
              {/* Subtle Background */}
              <div className="flex-1 bg-muted/30 relative overflow-hidden">
                {/* Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-5 dark:opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
                
                {/* Messages Container */}
                <ScrollArea className="relative z-10 h-full px-4 py-2">
                  <div className="space-y-2 pb-4">
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
                            
                            <div className={`flex gap-2 ${isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                              {/* Client Avatar */}
                              {!isFromAdmin && (
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={selectedClient?.photoURL} />
                                  <AvatarFallback className="bg-blue-500 text-white">
                                    {selectedClient?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              {/* Spacer for admin messages */}
                              {isFromAdmin && <div className="w-8" />}
                              
                              {/* Message Bubble */}
                              <div
                                className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                                  isFromAdmin
                                    ? 'bg-green-500 text-white rounded-br-md'
                                    : 'bg-blue-500 text-white rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.text}</p>
                                <p
                                  className={`text-xs mt-1 ${
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

                {/* WhatsApp-style Input Area */}
                <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-end gap-2">
                    {/* Attachment Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    {/* Message Input */}
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="pr-12 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[40px] max-h-[120px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Send/Voice Button */}
                    {newMessage.trim() ? (
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendingMessage}
                        size="icon"
                        className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              <div className="text-center text-foreground">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MessageCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select a client to start messaging</h3>
                <p className="text-muted-foreground">Choose a client from the list to begin a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}