import { useState, useRef, useEffect } from "react";
import { MessageCircle, ArrowLeft, MoreVertical, Send } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminConversationList } from "@/components/admin/AdminConversationList";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { User, Message } from "@/types";
import { where, orderBy } from "firebase/firestore";

export default function AdminMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { effectiveUser: user } = useAuth();

  // Fetch users
  const { data: users } = useFirestoreCollection<User>("users", [
    orderBy("createdAt", "desc")
  ]);

  // Fetch all messages
  const { data: allMessages, loading: messagesLoading } = useFirestoreCollection<Message>(
    "messages",
    [orderBy("createdAt", "asc")]
  );

  // Filter messages for the selected conversation
  const messages = allMessages?.filter(message => {
    if (!selectedConversation || !user) return false;
    
    // Check if message belongs to this conversation
    const isFromConversation = (
      message.chatRoom === selectedConversation ||
      (message.fromUser === user.uid && message.toUser === selectedConversation.replace('_admin', '')) ||
      (message.fromUser === selectedConversation.replace('_admin', '') && message.toUser === user.uid) ||
      (message.fromUser === "admin" && message.toUser === selectedConversation.replace('_admin', '')) ||
      (message.fromUser === selectedConversation.replace('_admin', '') && message.toUser === "admin")
    );
    
    return isFromConversation;
  }) || [];

  const { add: addMessage, loading: sendingMessage } = useFirestoreActions("messages");

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const clientUserId = selectedConversation.replace('_admin', '');
    
    try {
      await addMessage({
        text: newMessage.trim(),
        fromUser: user.uid,
        toUser: clientUserId,
        chatRoom: selectedConversation,
        createdAt: new Date(),
        read: false,
        messageType: 'text'
      });
      
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-background to-muted/30 relative">
      <div className="container mx-auto px-4 sm:px-6 px-safe py-2 relative z-10 min-h-full flex flex-col">
        {/* Header with Back Navigation - Only show on mobile when no conversation selected */}
        {!selectedConversation && (
          <div className="flex items-center justify-between mb-4 flex-shrink-0 sm:hidden">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">Messages</h1>
          </div>
        )}

        {/* Chat Content */}
        <div className="chat-content flex-1">
          {/* Conversation List - Always visible on desktop, conditional on mobile */}
          <div className={`${selectedConversation ? 'hidden sm:block' : 'block'} conversation-selector`}>
            <AdminConversationList 
              onSelectConversation={handleSelectConversation}
              onBack={() => window.location.href = '/admin'}
              selectedConversation={selectedConversation}
            />
          </div>

          {/* Chat Area - Hidden on mobile when no selection, always visible on desktop */}
          <div className={`${selectedConversation ? 'block' : 'hidden sm:block'} chat-area`}>
            {selectedConversation ? (
              <AdminConversationView 
                selectedConversation={selectedConversation}
                users={users}
                onBackToConversations={handleBackToConversations}
                messages={messages}
                messagesLoading={messagesLoading}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                sendingMessage={sendingMessage}
                messagesEndRef={messagesEndRef}
                user={user}
              />
            ) : (
              /* Desktop fallback when no conversation selected */
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a client conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for the conversation view
function AdminConversationView({ 
  selectedConversation, 
  users, 
  onBackToConversations, 
  messages, 
  messagesLoading, 
  newMessage, 
  setNewMessage, 
  handleSendMessage, 
  sendingMessage, 
  messagesEndRef,
  user
}: any) {
  const clientUserId = selectedConversation.replace('_admin', '');
  const selectedClient = users?.find((u: any) => u.uid === clientUserId);

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
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "";
    }
  };

  return (
    <>
      {/* Fixed Combined Header */}
      <div className="chat-header-main text-foreground shadow-sm">
        <div className="px-4 py-2 flex items-center justify-start gap-3 h-full sm:px-6 sm:py-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9 p-0 rounded-full sm:hidden" onClick={onBackToConversations}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <Avatar className="h-11 w-11 ring-2 ring-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 shadow-md sm:h-12 sm:w-12">
            <AvatarImage src={selectedClient?.photoURL} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              <span className="text-sm sm:text-base">{selectedClient?.name?.split(' ').map((n: any) => n[0]).join('').toUpperCase()}</span>
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="font-semibold text-foreground truncate text-sm leading-tight sm:text-base sm:leading-normal">{selectedClient?.name || 'Client'}</h1>
            <p className="text-xs text-muted-foreground truncate leading-tight sm:text-sm sm:leading-normal" style={{ marginTop: '2px' }}>{selectedClient?.email || 'client@example.com'}</p>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9">
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
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((message: any, index: number) => {
                  const isFromAdmin = message.fromUser === "admin" || message.fromUser === user?.uid;
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showTime = !prevMessage || 
                    Math.abs(new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 5 * 60 * 1000; // 5 minutes

                  return (
                    <div key={message.id || index} className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-lg sm:max-w-[60%] sm:px-4 sm:py-3 ${
                        isFromAdmin
                          ? 'bg-green-500 text-white rounded-br-sm'
                          : 'bg-blue-500 text-white rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-tight mb-0.5 sm:text-base sm:leading-normal sm:mb-1">{message.text}</p>
                        <p className={`text-xs mt-0.5 mb-0.5 sm:text-sm sm:mt-1 sm:mb-1 ${
                          isFromAdmin
                            ? 'text-green-100'
                            : 'text-blue-100'
                        }`}>
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
                  <p className="text-muted-foreground mb-4">Start the conversation with {selectedClient?.name}</p>
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
    </>
  );
}