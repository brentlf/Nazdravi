import { useState } from "react";
import { ConversationList } from "@/components/dashboard/ConversationList";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { User as UserType } from "@/types";

export default function DashboardMessages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Get the other user in the conversation
  const { data: users } = useFirestoreCollection<UserType>("users");
  const otherUserId = selectedConversation ? selectedConversation.replace('_admin', '') : null;
  const otherUser = users?.find(u => u.uid === otherUserId);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // Two-page design for mobile, split-pane for desktop
  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full dashboard-viewport">
      {/* Back Navigation - Always visible */}
      <div className="flex-shrink-0 px-3 py-1 border-b border-border bg-card">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
            <ArrowLeft className="w-3 h-3" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      {/* Mobile: Show conversation list OR chat, not both */}
      {!selectedConversation ? (
        <div className="flex-1 overflow-hidden" style={{ marginBottom: '20px' }}>
          <ConversationList 
            onSelectConversation={handleSelectConversation}
            onBack={() => window.history.back()}
            selectedConversation={selectedConversation}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col" style={{ height: 'calc(100% - 80px)', marginBottom: '20px' }}>
          {/* Desktop: Show both conversation list and chat */}
          <div className="hidden sm:flex h-full">
            <div className="w-80 border-r border-border">
              <ConversationList 
                onSelectConversation={handleSelectConversation}
                onBack={() => window.history.back()}
                selectedConversation={selectedConversation}
                isConversationOpen={true}
              />
            </div>
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="chat-header-main text-foreground shadow-sm">
                <div className="px-2 py-1 flex items-center justify-start gap-1 h-full sm:px-3 sm:py-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-8 w-8 p-0 rounded-full sm:hidden" onClick={handleBackToConversations}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="h-9 w-9 ring-2 ring-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 shadow-md sm:h-10 sm:w-10">
                    <AvatarImage src={otherUser?.photoURL} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                      <span className="text-xs sm:text-sm">{otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                    <h1 className="font-semibold text-foreground truncate text-xs leading-tight sm:text-sm sm:leading-normal mb-0 w-full">{otherUser?.name || 'Nutritionist'}</h1>
                    <p className="text-xs text-muted-foreground truncate leading-tight sm:text-xs sm:leading-normal mt-0 mb-0 w-full">{otherUser?.email || 'nutritionist@example.com'}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Chat Background */}
              <div className="flex-1 bg-muted/30 relative overflow-hidden chat-messages-container min-h-0" style={{ height: 'calc(100% - 80px)' }}>
                <div
                  className="absolute inset-0 opacity-5 dark:opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />
                {/* Messages Container */}
                <div className="relative z-10 h-full chat-message-thread">
                  <MessageThread conversationId={selectedConversation} />
                </div>
              </div>
              {/* Input Area - Outside message container */}
              <div className="bg-card border-t border-border px-2 py-0.5 flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full py-2 px-4 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder:text-muted-foreground"
                    />
                  </div>
                  <button className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md flex items-center justify-center">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Show only chat conversation */}
          <div className="sm:hidden flex flex-col" style={{ height: 'calc(100% - 80px)', marginBottom: '20px' }}>
            {/* Mobile Chat Header */}
            <div className="chat-header-main text-foreground shadow-sm">
              <div className="px-2 py-0.5 flex items-center justify-start gap-1 h-full">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 h-9 w-9 p-0 rounded-full" onClick={handleBackToConversations}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="h-11 w-11 ring-2 ring-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
                  <AvatarImage src={otherUser?.photoURL} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    <span className="text-sm">{otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
                  <h1 className="font-semibold text-foreground truncate text-sm leading-tight mb-0 w-full">{otherUser?.name || 'Nutritionist'}</h1>
                  <p className="text-xs text-muted-foreground truncate leading-tight mt-0 mb-0 w-full">{otherUser?.email || 'nutritionist@example.com'}</p>
                </div>
              </div>
            </div>
          {/* Mobile Chat Background */}
          <div className="flex-1 bg-muted/30 relative overflow-hidden chat-messages-container min-h-0" style={{ height: 'calc(100% - 80px)' }}>
            <div
              className="absolute inset-0 opacity-5 dark:opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            {/* Messages Container */}
            <div className="relative z-10 h-full chat-message-thread">
              <MessageThread conversationId={selectedConversation} />
            </div>
          </div>
          {/* Mobile Input Area - Outside message container */}
          <div className="bg-card border-t border-border px-2 py-0.5 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full py-2 px-4 rounded-full border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder:text-muted-foreground"
                />
              </div>
              <button className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md flex items-center justify-center">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Desktop fallback when no conversation selected */}
      {!selectedConversation && (
        <div className="hidden sm:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
