import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Send, User } from "lucide-react";

interface MessagingSystemProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

interface Message {
  id: string;
  user_id?: string;
  client_id: string;
  sender_type: "coach" | "client";
  content: string;
  read: boolean;
  created_at: string;
}

const MessagingSystem = ({
  clientId,
  clientName,
  clientEmail,
}: MessagingSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!user || !clientId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } else {
        setMessages(data || []);
        // Mark unread messages as read
        const unreadMessages = data
          ?.filter((m) => !m.read && m.sender_type === "client")
          .map((m) => m.id);

        if (unreadMessages && unreadMessages.length > 0) {
          await supabase
            .from("messages")
            .update({ read: true })
            .in("id", unreadMessages);
        }
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages-${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);

          // Mark message as read if it's from client
          if (payload.new.sender_type === "client") {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", payload.new.id);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, clientId, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !clientId) return;

    try {
      const { error } = await supabase.from("messages").insert([
        {
          user_id: user.id,
          client_id: clientId,
          sender_type: "coach",
          content: newMessage.trim(),
          read: false,
        },
      ]);

      if (error) throw error;

      // Clear input - don't update local state as the subscription will handle it
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the message is from today
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // Check if the message is from yesterday
    else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
    // Otherwise, show the full date
    else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Messages with {clientName}</CardTitle>
        <CardDescription>
          Direct messaging between you and your client
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-5rem)]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(messageGroups).map(([date, msgs]) => (
                    <div key={date} className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-card px-2 text-muted-foreground">
                            {new Date(date).toLocaleDateString(undefined, {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {msgs.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === "coach" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex items-start gap-2 max-w-[80%] ${message.sender_type === "coach" ? "flex-row-reverse" : ""}`}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  message.sender_type === "coach"
                                    ? undefined
                                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${clientEmail}`
                                }
                              />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`rounded-lg px-3 py-2 text-sm ${message.sender_type === "coach" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                            >
                              <div>{message.content}</div>
                              <div
                                className={`text-xs mt-1 ${message.sender_type === "coach" ? "text-blue-100" : "text-gray-500"}`}
                              >
                                {formatMessageTime(message.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="mt-4 flex items-center space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MessagingSystem;
