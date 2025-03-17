import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
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
import { Toaster } from "@/components/ui/toaster";
import { Send, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  user_id?: string;
  client_id: string;
  sender_type: "coach" | "client";
  content: string;
  read: boolean;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function ClientMessaging() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get("code");
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verify access code and load client data
  useEffect(() => {
    const verifyAccess = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);

        // Check if access code is valid
        const { data: portalData, error: portalError } = await supabase
          .from("client_portals")
          .select("*")
          .eq("client_id", clientId)
          .single();

        if (portalError || !portalData) {
          console.error("Portal not found:", portalError);
          return;
        }

        // If access code is provided in URL and matches
        if (accessCode && accessCode === portalData.access_code) {
          setIsAuthenticated(true);
          loadClientData();

          // Update last accessed timestamp
          await supabase
            .from("client_portals")
            .update({ last_accessed: new Date().toISOString() })
            .eq("id", portalData.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error verifying access:", error);
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [clientId, accessCode]);

  // Load client data after authentication
  const loadClientData = async () => {
    if (!clientId) return;

    try {
      // Load client info
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, name, email")
        .eq("id", clientId)
        .single();

      if (clientError || !clientData) {
        throw new Error("Client not found");
      }

      setClient(clientData);

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Subscribe to new messages
      const subscription = supabase
        .channel(`client-messages-${clientId}`)
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
          },
        )
        .subscribe();

      // Mark coach messages as read
      const unreadMessages = messagesData
        ?.filter((m) => !m.read && m.sender_type === "coach")
        .map((m) => m.id);

      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from("messages")
          .update({ read: true })
          .in("id", unreadMessages);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading client data:", error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading your information.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle manual access code verification
  const verifyAccessCode = async () => {
    if (!clientId || !accessCodeInput) return;

    try {
      setIsLoading(true);

      const { data: portalData, error: portalError } = await supabase
        .from("client_portals")
        .select("*")
        .eq("client_id", clientId)
        .single();

      if (portalError || !portalData) {
        toast({
          title: "Access Error",
          description: "This portal does not exist.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (accessCodeInput === portalData.access_code) {
        setIsAuthenticated(true);
        loadClientData();

        // Update last accessed timestamp
        await supabase
          .from("client_portals")
          .update({ last_accessed: new Date().toISOString() })
          .eq("id", portalData.id);
      } else {
        toast({
          title: "Invalid Code",
          description: "The access code you entered is incorrect.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error verifying access code:", error);
      toast({
        title: "Verification Error",
        description: "There was a problem verifying your access code.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !client) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            client_id: client.id,
            sender_type: "client",
            content: newMessage.trim(),
            read: false,
          },
        ])
        .select();

      if (error) throw error;

      // Update local state
      if (data && data.length > 0) {
        setMessages([...messages, data[0]]);
      }

      // Clear input
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // If not authenticated, show access code form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Client Messaging</CardTitle>
            <CardDescription>
              Enter your access code to message your coach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Verifying access...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter access code"
                    value={accessCodeInput}
                    onChange={(e) => setAccessCodeInput(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={verifyAccessCode}
                  disabled={!accessCodeInput}
                >
                  Access Messaging
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="font-bold text-xl text-primary">
                FitCoach Pro
              </span>
            </div>
            {client && (
              <div className="text-right">
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-muted-foreground">
                  {client.email}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Message Your Coach</CardTitle>
            <CardDescription>
              Send messages to your coach and get responses in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100vh-300px)] flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 pr-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
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
                              className={`flex ${message.sender_type === "client" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`flex items-start gap-2 max-w-[80%] ${message.sender_type === "client" ? "flex-row-reverse" : ""}`}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender_type === "client" ? client?.email : "coach"}`}
                                  />
                                  <AvatarFallback>
                                    {message.sender_type === "client"
                                      ? client?.name[0]
                                      : "C"}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={`rounded-lg px-3 py-2 text-sm ${message.sender_type === "client" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                                >
                                  <div>{message.content}</div>
                                  <div
                                    className={`text-xs mt-1 ${message.sender_type === "client" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
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
      </main>

      <footer className="bg-background border-t border-border py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FitCoach Pro. All rights reserved.
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
