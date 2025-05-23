import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { add: addMessage, loading: sending } = useFirestoreActions("messages");

  // Create chat room ID (user_admin format)
  const chatRoom = user ? `${user.uid}_admin` : "";

  // Fetch messages for this chat room
  const { data: messages, loading } = useFirestoreCollection<Message>("messages", [
    where("chatRoom", "==", chatRoom),
    orderBy("createdAt", "asc")
  ]);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      text: "",
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data: MessageFormData) => {
    if (!user) return;

    try {
      await addMessage({
        fromUser: user.uid,
        toUser: "admin",
        text: data.text,
        chatRoom: chatRoom,
      });

      form.reset();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading messages...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Chat with Your Nutritionist
        </CardTitle>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((message) => {
                const isFromUser = message.fromUser === user?.uid;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isFromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isFromUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30">
                          <Bot className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        isFromUser
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isFromUser 
                            ? 'text-primary-100' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {isFromUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback>
                          {user?.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Start a conversation with your nutritionist
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-6 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
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
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={sending} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
