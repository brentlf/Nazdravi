import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Bot, User, Smile, Paperclip, Mic } from "lucide-react";
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

export function MessageThread() {
  const { effectiveUser: user, isAdminViewingClient } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { add: addMessage, update: updateMessage, loading: sending } = useFirestoreActions("messages");

  // Create chat room ID (user_admin format)
  const chatRoom = user ? `${user.uid}_admin` : "";

  // Fetch messages with fallback approach - try without orderBy first to test
  const { data: messagesNew } = useFirestoreCollection<Message>("messages", 
    user ? [where("chatRoom", "==", chatRoom)] : []
  );
  
  const { data: messagesLegacy } = useFirestoreCollection<Message>("messages", 
    user ? [where("fromUser", "==", user.uid)] : []
  );
  
  const { data: messagesLegacyTo } = useFirestoreCollection<Message>("messages", 
    user ? [where("toUser", "==", user.uid)] : []
  );

  // Combine all messages and deduplicate
  const allMessages = [
    ...(messagesNew || []),
    ...(messagesLegacy || []),
    ...(messagesLegacyTo || [])
  ];
  
  const messages = allMessages.filter((msg, index, self) => 
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
      messagesNew: messagesNew?.length || 0,
      messagesLegacy: messagesLegacy?.length || 0,
      messagesLegacyTo: messagesLegacyTo?.length || 0,
      totalMessages: messages?.length || 0,
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
        <div className="space-y-2 pb-4">
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
                  
                  <div className={`flex gap-2 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                    {/* Nutritionist Avatar */}
                    {!isFromUser && showAvatar && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-green-500 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Spacer for user messages */}
                    {isFromUser && <div className="w-8" />}
                    
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl ${
                        isFromUser
                          ? 'bg-green-500 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isFromUser 
                            ? 'text-green-100' 
                            : 'text-gray-500 dark:text-gray-400'
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
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-medium mb-2">Start a conversation</h3>
              <p className="text-white/70 text-sm">
                Send a message to your nutritionist
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* WhatsApp-style Input Area */}
      <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-2">
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
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Type a message"
                        disabled={sending}
                        className="pr-12 py-3 rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Send/Voice Button */}
            {form.watch("text")?.trim() ? (
              <Button
                type="submit"
                disabled={sending}
                size="icon"
                className="h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
