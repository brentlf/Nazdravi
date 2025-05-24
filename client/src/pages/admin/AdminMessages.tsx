import { useState } from "react";
import { MessageCircle, Send, Search, User, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    
    // Also check direct user-to-user messages
    const isDirectMessage = (
      (message.fromUser === user.uid && message.toUser === clientUserId) ||
      (message.fromUser === clientUserId && message.toUser === user.uid) ||
      (message.fromUser === "admin" && message.toUser === clientUserId) ||
      (message.fromUser === clientUserId && message.toUser === "admin")
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



  const { add: addMessage, loading: sendingMessage } = useFirestoreActions("messages");

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
      });

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

  return (
    <div className="min-h-screen py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header with Back Navigation */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with your clients directly
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Client List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Clients
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredUsers.map((client) => {
                  const chatRoom = createChatRoom(client.uid);
                  const lastMessage = getLastMessage(client.uid);
                  const isSelected = selectedChatRoom === chatRoom;

                  return (
                    <div
                      key={client.uid}
                      onClick={() => setSelectedChatRoom(chatRoom)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={client.photoURL} />
                          <AvatarFallback>
                            {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{client.name}</p>
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(lastMessage.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                          {lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {lastMessage.text}
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
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedChatRoom ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Chat with {filteredUsers.find(u => createChatRoom(u.uid) === selectedChatRoom)?.name}
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="p-0">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          </div>
                        ))}
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.fromUser === "admin" || message.fromUser === user?.uid ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.fromUser === "admin" || message.fromUser === user?.uid
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.fromUser === "admin" || message.fromUser === user?.uid ? 'text-blue-100' : 'text-muted-foreground'
                            }`}>
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
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-12">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
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
                        className="flex-1 min-h-[40px] max-h-[120px]"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a client to start messaging</h3>
                  <p>Choose a client from the list to begin a conversation</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}