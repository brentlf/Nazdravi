import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCollection, useFirestoreActions } from "@/hooks/useFirestore";
import { Message } from "@/types";
import { where, orderBy } from "firebase/firestore";

const messageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty").max(500, "Message too long"),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageThreadProps {
  conversationId?: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { effectiveUser: user, isAdminViewingClient } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { add: addMessage, update: updateMessage, loading: sending } = useFirestoreActions("messages");

  // Use provided conversationId or create default chat room ID
  const chatRoom = conversationId || (user ? `${user.uid}_admin` : "");
  
  console.log('MessageThread - conversationId:', conversationId);
  console.log('MessageThread - chatRoom:', chatRoom);
  console.log('MessageThread - user:', user);

  // Extract the other user ID from conversation ID
  const otherUserId = conversationId ? conversationId.split('_').find(id => id !== user?.uid) : null;
  console.log('MessageThread - otherUserId:', otherUserId);

  // Fetch messages with multiple approaches to handle different ID formats
  const { data: messagesNew } = useFirestoreCollection<Message>("messages", 
    user ? [where("chatRoom", "==", chatRoom)] : []
  );
  
  const { data: messagesLegacy } = useFirestoreCollection<Message>("messages", 
    user ? [where("fromUser", "==", user.uid)] : []
  );
  
  const { data: messagesLegacyTo } = useFirestoreCollection<Message>("messages", 
    user ? [where("toUser", "==", user.uid)] : []
  );

  // Also try to fetch messages by user IDs if conversationId is provided
  const { data: messagesByUsers } = useFirestoreCollection<Message>("messages", 
    user && otherUserId ? [
      where("fromUser", "in", [user.uid, otherUserId]),
      where("toUser", "in", [user.uid, otherUserId])
    ] : []
  );

  // Combine all messages and deduplicate
  const allMessages = [
    ...(messagesNew || []),
    ...(messagesLegacy || []),
    ...(messagesLegacyTo || []),
    ...(messagesByUsers || [])
  ];
  
  // Filter messages for the specific conversation if conversationId is provided
  const filteredMessages = conversationId && otherUserId ? 
    allMessages.filter(msg => 
      (msg.fromUser === user?.uid && msg.toUser === otherUserId) ||
      (msg.fromUser === otherUserId && msg.toUser === user?.uid) ||
      (msg.chatRoom === conversationId) ||
      (msg.chatRoom === chatRoom)
    ) : allMessages;
  
  const messages = filteredMessages.filter((msg, index, self) => 
    index === self.findIndex(m => m.id === msg.id)
  ).sort((a, b) => {
    // Handle different date formats from Firebase
    let dateA, dateB;
    
    if (a.createdAt && typeof a.createdAt.toDate === 'function') {
      dateA = a.createdAt.toDate();
    } else if (a.createdAt) {
      dateA = new Date(a.createdAt);
    } else {
      dateA = new Date(0);
    }
    
    if (b.createdAt && typeof b.createdAt.toDate === 'function') {
      dateB = b.createdAt.toDate();
    } else if (b.createdAt) {
      dateB = new Date(b.createdAt);
    } else {
      dateB = new Date(0);
    }
    
    return dateA.getTime() - dateB.getTime();
  });

  const loading = !messagesNew && !messagesLegacy && !messagesLegacyTo;

  // Debug logging to see what's happening with each query
  useEffect(() => {
    console.log("MessageThread Debug:", {
      user: user?.uid,
      chatRoom,
      conversationId,
      otherUserId,
      messagesNew: messagesNew?.length || 0,
      messagesLegacy: messagesLegacy?.length || 0,
      messagesLegacyTo: messagesLegacyTo?.length || 0,
      messagesByUsers: messagesByUsers?.length || 0,
      allMessages: allMessages.length,
      filteredMessages: filteredMessages.length,
      finalMessages: messages.length,
      loading
    });
  }, [user, chatRoom, messagesNew, messagesLegacy, messagesLegacyTo, messages, loading]);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      text: "",
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when component loads and user views them
  useEffect(() => {
    if (messages && user) {
      const unreadMessages = messages.filter(msg => 
        msg.toUser === user.uid && (msg.read === false || msg.read === undefined)
      );
      
      // Mark each unread message as read
      unreadMessages.forEach(async (message) => {
        try {
          await updateMessage(message.id, { read: true });
        } catch (error) {
          console.error('Failed to mark message as read:', error);
        }
      });
    }
  }, [messages, user]);

  // Helper function to format message timestamp
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
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "";
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.warn("Error formatting message time:", error);
      return "";
    }
  };

  const onSubmit = async (data: MessageFormData) => {
    if (!user) return;

    try {
      await addMessage({
        fromUser: user.uid,
        toUser: "admin", 
        text: data.text,
        chatRoom: `${user.uid}_admin`, // Standardized format for consistency
        createdAt: new Date(),
        read: false,
        messageType: "text"
      });

      // Send email notification to admin
      try {
        const response = await fetch('/api/emails/message-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromUserId: user.uid,
            toUserId: "admin",
            messageType: "General",
            urgency: "Medium",
            content: data.text
          }),
        });
        
        if (response.ok) {
          console.log('Admin notification sent successfully');
        } else {
          console.error('Failed to send admin notification');
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the message sending if email notification fails
      }

      form.reset();
      // Messages will update automatically via real-time listener
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-pulse text-white/70 mb-2">Loading messages...</div>
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area - WhatsApp Style */}
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-0.5 pb-2">
          {messages && messages.length > 0 ? (
            messages.map((message, index) => {
              const isFromUser = message.fromUser === user?.uid;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !isFromUser && (!prevMessage || prevMessage.fromUser !== message.fromUser);
              const showTime = !prevMessage || 
                Math.abs(new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime()) > 5 * 60 * 1000; // 5 minutes
              
              return (
                <div key={message.id}>
                  {/* Time separator */}
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <div className="bg-black/10 dark:bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
                        {formatMessageTime(message.createdAt)}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex gap-1.5 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                    {/* Nutritionist Avatar */}
                    {!isFromUser && showAvatar && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="bg-green-500 text-white">
                          <Bot className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Spacer for user messages */}
                    {isFromUser && <div className="w-6" />}
                    
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg sm:max-w-[60%] sm:px-4 sm:py-3 ${
                        isFromUser
                          ? 'bg-green-500 text-white rounded-br-sm'
                          : 'bg-blue-500 text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-tight mb-0.5 sm:text-base sm:leading-normal sm:mb-1">{message.text}</p>
                      <p
                        className={`text-xs mt-0.5 mb-0.5 sm:text-sm sm:mt-1 sm:mb-1 ${
                          isFromUser 
                            ? 'text-green-100' 
                            : 'text-blue-100'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-foreground font-medium mb-2">Start a conversation</h3>
              <p className="text-muted-foreground text-sm">
                Send a message to your nutritionist
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Clean Input Area */}
      <div className="bg-card border-t border-border px-4 py-2 flex-shrink-0 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-3">
            {/* Message Input */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Type your message..."
                      disabled={sending}
                        className="py-2 px-4 rounded-full border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder:text-muted-foreground"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Send Button */}
            <Button
              type="submit"
              disabled={sending || !form.watch("text")?.trim()}
              size="icon"
              className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
