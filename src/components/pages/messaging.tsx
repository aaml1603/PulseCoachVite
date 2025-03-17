import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import MessagingSystem from "@/components/dashboard/MessagingSystem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  unreadCount?: number;
}

export default function Messaging() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch clients
  useEffect(() => {
    if (!user) return;

    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        // Get unread message counts for each client
        const clientsWithUnreadCounts = await Promise.all(
          (data || []).map(async (client) => {
            const { count, error: countError } = await supabase
              .from("messages")
              .select("*", { count: "exact" })
              .eq("client_id", client.id)
              .eq("sender_type", "client")
              .eq("read", false);

            return {
              ...client,
              unreadCount: countError ? 0 : count || 0,
            };
          }),
        );

        setClients(clientsWithUnreadCounts);
        setFilteredClients(clientsWithUnreadCounts);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    // Subscribe to message changes
    const subscription = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_type=eq.client`,
        },
        (payload) => {
          // Update unread count for the client
          setClients((prevClients) =>
            prevClients.map((client) =>
              client.id === payload.new.client_id
                ? { ...client, unreadCount: (client.unreadCount || 0) + 1 }
                : client,
            ),
          );
          setFilteredClients((prevClients) =>
            prevClients.map((client) =>
              client.id === payload.new.client_id
                ? { ...client, unreadCount: (client.unreadCount || 0) + 1 }
                : client,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Filter clients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query),
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  // Handle client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Client List Sidebar */}
        <div className="w-80 border-r border-border flex flex-col bg-background">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No clients found" : "No clients available"}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredClients.map((client) => (
                  <Button
                    key={client.id}
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto ${selectedClient?.id === client.id ? "bg-muted" : ""}`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center w-full">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.email}`}
                        />
                        <AvatarFallback>{client.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{client.name}</span>
                          {client.unreadCount ? (
                            <Badge className="ml-2">{client.unreadCount}</Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.email}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 flex flex-col">
          {selectedClient ? (
            <MessagingSystem
              clientId={selectedClient.id}
              clientName={selectedClient.name}
              clientEmail={selectedClient.email}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/30">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a client</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Choose a client from the list to start messaging or use the
                search to find a specific client.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
