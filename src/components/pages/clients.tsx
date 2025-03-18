import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  Users,
  Plus,
  ChevronRight,
  Copy,
  Check,
  User,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  LinkIcon,
  MessageSquare,
  Dumbbell,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Types
interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  avatar_url?: string;
}

interface ClientPortal {
  id: string;
  client_id: string;
  access_code: string;
  url: string;
  created_at: string;
  last_accessed?: string;
}

interface Workout {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: string;
  due_date: string;
  created_at: string;
}

const ClientsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [clientPortals, setClientPortals] = useState<ClientPortal[]>([]);
  const [loading, setLoading] = useState({
    clients: true,
    workouts: true,
    portals: true,
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editClientData, setEditClientData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [copiedPortalId, setCopiedPortalId] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<{
    [key: string]: { sent_at: string; status: string };
  }>({});

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchClients();

      // Subscribe to email logs updates
      const emailLogsSubscription = supabase
        .channel("email-logs-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "email_logs",
          },
          (payload) => {
            const log = payload.new;
            setEmailLogs((prev) => ({
              ...prev,
              [log.client_id]: {
                sent_at: log.sent_at,
                status: log.status,
              },
            }));
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(emailLogsSubscription);
      };
    }
  }, [user, navigate]);

  // Fetch clients from database
  const fetchClients = async () => {
    try {
      setLoading((prev) => ({ ...prev, clients: true }));
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      setClients(data || []);

      // After fetching clients, fetch related data
      if (data && data.length > 0) {
        fetchWorkouts();
        fetchClientPortals(data.map((client) => client.id));
      } else {
        setLoading((prev) => ({
          ...prev,
          clients: false,
          workouts: false,
          portals: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error fetching clients",
        description: "There was a problem loading your clients.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, clients: false }));
    }
  };

  // Fetch workouts from database
  const fetchWorkouts = async () => {
    try {
      setLoading((prev) => ({ ...prev, workouts: true }));
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast({
        title: "Error fetching workouts",
        description: "There was a problem loading your workouts.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, workouts: false }));
    }
  };

  // Fetch client portals from database
  const fetchClientPortals = async (clientIds: string[]) => {
    if (!clientIds || !clientIds.length) {
      setLoading((prev) => ({ ...prev, portals: false }));
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, portals: true }));
      const { data, error } = await supabase
        .from("client_portals")
        .select("*")
        .in("client_id", clientIds);

      if (error) throw error;
      setClientPortals(data || []);

      // Also fetch email logs for these clients
      const { data: emailLogsData, error: emailLogsError } = await supabase
        .from("email_logs")
        .select("*")
        .in("client_id", clientIds)
        .eq("email_type", "portal_invitation")
        .order("sent_at", { ascending: false });

      if (!emailLogsError && emailLogsData) {
        // Create a map of client_id to their latest email log
        const logsMap: { [key: string]: { sent_at: string; status: string } } =
          {};
        emailLogsData.forEach((log) => {
          if (
            !logsMap[log.client_id] ||
            new Date(log.sent_at) > new Date(logsMap[log.client_id].sent_at)
          ) {
            logsMap[log.client_id] = {
              sent_at: log.sent_at,
              status: log.status,
            };
          }
        });
        setEmailLogs(logsMap);
      }
    } catch (error) {
      console.error("Error fetching client portals:", error);
      toast({
        title: "Error fetching client portals",
        description: "There was a problem loading your client portals.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, portals: false }));
    }
  };

  // Add new client
  const addNewClient = async () => {
    try {
      if (!newClientData.name || !newClientData.email) {
        toast({
          title: "Missing information",
          description: "Please provide a name and email for the client.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            user_id: user?.id,
            name: newClientData.name,
            email: newClientData.email,
            phone: newClientData.phone,
            status: "active",
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Client added",
        description: `${newClientData.name} has been added to your clients.`,
      });

      // Reset form and refresh clients
      setNewClientData({ name: "", email: "", phone: "" });

      // Update clients state directly with the new client
      if (data && data.length > 0) {
        setClients((prevClients) => [...prevClients, data[0]]);
        // Then fetch all related data
        fetchWorkouts();
        fetchClientPortals([...clients.map((client) => client.id), data[0].id]);
      } else {
        // Fallback to full refresh if data is not returned properly
        fetchClients();
      }
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error adding client",
        description: "There was a problem adding the client.",
        variant: "destructive",
      });
    }
  };

  // Update client
  const updateClient = async () => {
    try {
      if (!editClientData.id || !editClientData.name || !editClientData.email) {
        toast({
          title: "Missing information",
          description: "Please provide a name and email for the client.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .update({
          name: editClientData.name,
          email: editClientData.email,
          phone: editClientData.phone,
          status: editClientData.status,
        })
        .eq("id", editClientData.id)
        .select();

      if (error) throw error;

      toast({
        title: "Client updated",
        description: `${editClientData.name}'s information has been updated.`,
      });

      // Update clients state directly
      if (data && data.length > 0) {
        setClients((prevClients) =>
          prevClients.map((client) =>
            client.id === editClientData.id ? data[0] : client,
          ),
        );

        // Update selected client if it's the one being edited
        if (selectedClient && selectedClient.id === editClientData.id) {
          setSelectedClient(data[0]);
        }
      } else {
        // Fallback to full refresh
        fetchClients();
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error updating client",
        description: "There was a problem updating the client.",
        variant: "destructive",
      });
    }
  };

  // Delete client
  const deleteClient = async () => {
    if (!clientToDelete) return;

    try {
      // First delete all related data
      // 1. Delete client portals
      const clientPortal = clientPortals.find(
        (p) => p.client_id === clientToDelete.id,
      );
      if (clientPortal) {
        const { error: portalError } = await supabase
          .from("client_portals")
          .delete()
          .eq("client_id", clientToDelete.id);

        if (portalError) throw portalError;
      }

      // 2. Delete client workouts
      const clientWorkouts = workouts.filter(
        (w) => w.client_id === clientToDelete.id,
      );
      if (clientWorkouts.length > 0) {
        const { error: workoutsError } = await supabase
          .from("workouts")
          .delete()
          .eq("client_id", clientToDelete.id);

        if (workoutsError) throw workoutsError;
      }

      // 3. Delete client notifications
      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("client_id", clientToDelete.id);

      if (notificationsError) {
        console.error("Error deleting notifications:", notificationsError);
        // Continue with client deletion even if notification deletion fails
      }

      // 4. Finally delete the client
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (error) throw error;

      toast({
        title: "Client deleted",
        description: `${clientToDelete.name} has been removed from your clients.`,
      });

      // Update state
      setClients((prevClients) =>
        prevClients.filter((client) => client.id !== clientToDelete.id),
      );

      // If the deleted client was selected, clear selection
      if (selectedClient && selectedClient.id === clientToDelete.id) {
        setSelectedClient(null);
      }

      // Clear client to delete
      setClientToDelete(null);

      // Update related data
      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter(
          (workout) => workout.client_id !== clientToDelete.id,
        ),
      );

      setClientPortals((prevPortals) =>
        prevPortals.filter((portal) => portal.client_id !== clientToDelete.id),
      );
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error deleting client",
        description: "There was a problem deleting the client.",
        variant: "destructive",
      });
    }
  };

  // Generate client portal
  const generateClientPortal = async (clientId: string) => {
    try {
      // Check if portal already exists
      const existingPortal = clientPortals.find(
        (portal) => portal.client_id === clientId,
      );

      if (existingPortal) {
        toast({
          title: "Portal already exists",
          description: "This client already has an active portal.",
        });
        return existingPortal;
      }

      // Generate random access code
      const accessCode = Math.random().toString(36).substring(2, 10);

      // Create portal URL
      const portalUrl = `${window.location.origin}/client-portal/${clientId}?code=${accessCode}`;

      const { data, error } = await supabase
        .from("client_portals")
        .insert([
          {
            client_id: clientId,
            access_code: accessCode,
            url: portalUrl,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Portal generated",
        description: "Client portal has been created successfully.",
      });

      // Update client portals state directly
      if (data && data.length > 0) {
        setClientPortals((prevPortals) => [...prevPortals, data[0]]);
      } else {
        // Fallback to refresh if data is not returned properly
        fetchClientPortals(clients.map((client) => client.id));
      }

      return data?.[0] || null;
    } catch (error) {
      console.error("Error generating client portal:", error);
      toast({
        title: "Error generating portal",
        description: "There was a problem creating the client portal.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Copy portal link to clipboard
  const copyPortalLink = (portalUrl: string, portalId: string) => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedPortalId(portalId);
    toast({
      title: "Link copied",
      description: "Portal link has been copied to clipboard.",
    });

    // Reset copied status after 3 seconds
    setTimeout(() => {
      setCopiedPortalId(null);
    }, 3000);
  };

  // Send portal link via email
  const sendPortalEmail = async (client: Client, portalUrl: string) => {
    try {
      setSendingEmail(client.id);

      // Get coach name if available
      const { data: coachData } = await supabase
        .from("coach_profiles")
        .select("full_name")
        .eq("user_id", user?.id)
        .single();

      const coachName = coachData?.full_name || user?.email || "Your Coach";

      // Call the edge function to send the email with explicit headers
      const { data, error } = await supabase.functions.invoke(
        "send-portal-email",
        {
          body: {
            clientId: client.id,
            clientEmail: client.email,
            clientName: client.name,
            portalUrl: portalUrl,
            coachName: coachName,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabase.auth.getSession()}`,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Email sent",
        description: `Portal link has been sent to ${client.email}.`,
      });

      // Update email logs state directly
      setEmailLogs((prev) => ({
        ...prev,
        [client.id]: {
          sent_at: new Date().toISOString(),
          status: "sent",
        },
      }));
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending email",
        description: "There was a problem sending the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
    }
  };

  // Calculate client compliance rate
  const getClientComplianceRate = (clientId: string) => {
    const clientWorkouts = workouts.filter(
      (workout) => workout.client_id === clientId,
    );
    if (clientWorkouts.length === 0) return 0;

    const completedWorkouts = clientWorkouts.filter(
      (workout) => workout.status === "completed",
    );
    return Math.round((completedWorkouts.length / clientWorkouts.length) * 100);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter clients based on search query and status filter
  const filteredClients = clients.filter((client) => {
    const matchesSearch = searchQuery
      ? client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? client.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Client Management
            </h1>
            <p className="text-muted-foreground">
              Manage your clients, their information, and access portals.
            </p>
          </div>
          <div className="flex space-x-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>
                    Enter the details of your new client below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newClientData.name}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          name: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClientData.email}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          email: e.target.value,
                        })
                      }
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={newClientData.phone}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addNewClient}>Add Client</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {statusFilter ? `Status: ${statusFilter}` : "Filter by status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                Active clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                Inactive clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Client List */}
        <div className="rounded-md border border-border">
          <div className="p-4 bg-background rounded-md">
            <div className="font-medium">Your Clients</div>
            <div className="text-sm text-muted-foreground">
              {filteredClients.length}{" "}
              {filteredClients.length === 1 ? "client" : "clients"} found
            </div>
          </div>
          <div className="relative w-full overflow-auto bg-background">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Compliance
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Portal
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 bg-background">
                {loading.clients ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      Loading clients...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      {searchQuery || statusFilter
                        ? "No clients match your search criteria."
                        : "No clients found. Add your first client to get started."}
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      data-client-id={client.id}
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.email}`}
                            />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>{client.name}</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{client.email}</td>
                      <td className="p-4 align-middle">
                        <Badge
                          variant={
                            client.status === "active" ? "default" : "secondary"
                          }
                        >
                          {client.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={getClientComplianceRate(client.id)}
                            className="h-2 w-[60px]"
                          />
                          <span>{getClientComplianceRate(client.id)}%</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {clientPortals.find(
                          (p) => p.client_id === client.id,
                        ) ? (
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Active
                            </Badge>
                            {emailLogs[client.id] && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                title={`Email sent on ${formatDate(emailLogs[client.id].sent_at)}`}
                              >
                                Emailed
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateClientPortal(client.id)}
                          >
                            Generate
                          </Button>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedClient(client)}
                              >
                                <User className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditClientData({
                                    id: client.id,
                                    name: client.name,
                                    email: client.email,
                                    phone: client.phone || "",
                                    status: client.status,
                                  });
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit client
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  const portal = clientPortals.find(
                                    (p) => p.client_id === client.id,
                                  );
                                  if (portal) {
                                    copyPortalLink(portal.url, portal.id);
                                  } else {
                                    generateClientPortal(client.id);
                                  }
                                }}
                              >
                                <LinkIcon className="mr-2 h-4 w-4" />
                                {clientPortals.find(
                                  (p) => p.client_id === client.id,
                                )
                                  ? "Copy portal link"
                                  : "Generate portal"}
                              </DropdownMenuItem>
                              {clientPortals.find(
                                (p) => p.client_id === client.id,
                              ) && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const portal = clientPortals.find(
                                      (p) => p.client_id === client.id,
                                    );
                                    if (portal) {
                                      sendPortalEmail(client, portal.url);
                                    }
                                  }}
                                  disabled={sendingEmail === client.id}
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  {sendingEmail === client.id
                                    ? "Sending..."
                                    : "Email portal link"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/workout-builder?client=${client.id}`,
                                  )
                                }
                              >
                                <Dumbbell className="mr-2 h-4 w-4" />
                                Create workout
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/messaging?client=${client.id}`)
                                }
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setClientToDelete(client)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedClient(client)}
                          >
                            <span className="sr-only">View details</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Client Details */}
        {selectedClient && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedClient.email}`}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedClient.name}</CardTitle>
                    <CardDescription>{selectedClient.email}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedClient(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="workouts">Workouts</TabsTrigger>
                  <TabsTrigger value="portal">Portal</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Compliance Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {getClientComplianceRate(selectedClient.id)}%
                        </div>
                        <Progress
                          value={getClientComplianceRate(selectedClient.id)}
                          className="h-2 mt-2"
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Assigned Workouts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            workouts.filter(
                              (w) => w.client_id === selectedClient.id,
                            ).length
                          }
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {
                            workouts.filter(
                              (w) =>
                                w.client_id === selectedClient.id &&
                                w.status === "completed",
                            ).length
                          }{" "}
                          completed
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Client Since</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatDate(selectedClient.created_at)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Client Information
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditClientData({
                            id: selectedClient.id,
                            name: selectedClient.name,
                            email: selectedClient.email,
                            phone: selectedClient.phone || "",
                            status: selectedClient.status,
                          });
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Email
                        </h4>
                        <p>{selectedClient.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Phone
                        </h4>
                        <p>{selectedClient.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Status
                        </h4>
                        <Badge
                          variant={
                            selectedClient.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedClient.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Joined
                        </h4>
                        <p>{formatDate(selectedClient.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="workouts" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Client Workouts</h3>
                    <Button
                      onClick={() =>
                        navigate(`/workout-builder?client=${selectedClient.id}`)
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Workout
                    </Button>
                  </div>

                  {workouts.filter((w) => w.client_id === selectedClient.id)
                    .length === 0 ? (
                    <div className="text-center py-8 border border-border rounded-md">
                      <Dumbbell className="h-12 w-12 text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium">
                        No workouts assigned
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This client doesn't have any workouts assigned yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {workouts
                        .filter((w) => w.client_id === selectedClient.id)
                        .sort(
                          (a, b) =>
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime(),
                        )
                        .map((workout) => (
                          <div
                            key={workout.id}
                            className="flex items-center justify-between p-3 border border-border rounded-md bg-card text-card-foreground"
                          >
                            <div>
                              <div className="font-medium">{workout.title}</div>
                              <div className="text-sm text-muted-foreground">
                                Due: {formatDate(workout.due_date)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  workout.status === "completed"
                                    ? "default"
                                    : workout.status === "in_progress"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {workout.status === "completed"
                                  ? "Completed"
                                  : workout.status === "in_progress"
                                    ? "In Progress"
                                    : "Assigned"}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  navigate(
                                    `/workout-builder?workout=${workout.id}`,
                                  )
                                }
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="portal" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Client Portal</h3>
                    {!clientPortals.find(
                      (p) => p.client_id === selectedClient.id,
                    ) && (
                      <Button
                        onClick={() => generateClientPortal(selectedClient.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Portal
                      </Button>
                    )}
                  </div>

                  {clientPortals.find(
                    (p) => p.client_id === selectedClient.id,
                  ) ? (
                    <div className="space-y-4">
                      <div className="p-4 border border-border rounded-md">
                        <h4 className="text-sm font-medium mb-2">
                          Portal Link
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Input
                            readOnly
                            value={
                              clientPortals.find(
                                (portal) =>
                                  portal.client_id === selectedClient.id,
                              )?.url || ""
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const portal = clientPortals.find(
                                (p) => p.client_id === selectedClient.id,
                              );
                              if (portal) copyPortalLink(portal.url, portal.id);
                            }}
                          >
                            {copiedPortalId ===
                            clientPortals.find(
                              (p) => p.client_id === selectedClient.id,
                            )?.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-muted-foreground">
                            Share this link with your client to give them access
                            to their workouts and progress tracking.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 whitespace-nowrap"
                            onClick={() => {
                              const portal = clientPortals.find(
                                (p) => p.client_id === selectedClient.id,
                              );
                              if (portal)
                                sendPortalEmail(selectedClient, portal.url);
                            }}
                            disabled={sendingEmail === selectedClient.id}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            {sendingEmail === selectedClient.id
                              ? "Sending..."
                              : "Send via Email"}
                          </Button>
                        </div>
                        {emailLogs[selectedClient.id] && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Last emailed:</span>{" "}
                            {formatDate(emailLogs[selectedClient.id].sent_at)}
                          </div>
                        )}
                      </div>

                      <div className="p-4 border border-border rounded-md">
                        <h4 className="text-sm font-medium mb-2">
                          Portal Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-xs text-muted-foreground">
                              Created
                            </h5>
                            <p className="text-sm">
                              {formatDate(
                                clientPortals.find(
                                  (p) => p.client_id === selectedClient.id,
                                )?.created_at || "",
                              )}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs text-muted-foreground">
                              Last Accessed
                            </h5>
                            <p className="text-sm">
                              {clientPortals.find(
                                (p) => p.client_id === selectedClient.id,
                              )?.last_accessed
                                ? formatDate(
                                    clientPortals.find(
                                      (p) => p.client_id === selectedClient.id,
                                    )?.last_accessed || "",
                                  )
                                : "Never"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-border rounded-md">
                      <LinkIcon className="h-12 w-12 text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium">
                        No portal generated
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate a portal to give this client access to their
                        workouts.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Client Dialog */}
      <Dialog
        open={!!editClientData.id}
        onOpenChange={(open) =>
          !open &&
          setEditClientData({
            id: "",
            name: "",
            email: "",
            phone: "",
            status: "",
          })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the client's information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editClientData.name}
                onChange={(e) =>
                  setEditClientData({
                    ...editClientData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editClientData.email}
                onChange={(e) =>
                  setEditClientData({
                    ...editClientData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone (optional)</Label>
              <Input
                id="edit-phone"
                value={editClientData.phone}
                onChange={(e) =>
                  setEditClientData({
                    ...editClientData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    value="active"
                    checked={editClientData.status === "active"}
                    onChange={() =>
                      setEditClientData({
                        ...editClientData,
                        status: "active",
                      })
                    }
                    className="h-4 w-4 border-border text-blue-600 focus:ring-blue-600"
                  />
                  <Label
                    htmlFor="status-active"
                    className="text-sm font-normal"
                  >
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-inactive"
                    name="status"
                    value="inactive"
                    checked={editClientData.status === "inactive"}
                    onChange={() =>
                      setEditClientData({
                        ...editClientData,
                        status: "inactive",
                      })
                    }
                    className="h-4 w-4 border-border text-blue-600 focus:ring-blue-600"
                  />
                  <Label
                    htmlFor="status-inactive"
                    className="text-sm font-normal"
                  >
                    Inactive
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditClientData({
                  id: "",
                  name: "",
                  email: "",
                  phone: "",
                  status: "",
                })
              }
            >
              Cancel
            </Button>
            <Button onClick={updateClient}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Confirmation */}
      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {clientToDelete?.name} and all
              associated data including workouts, progress metrics, and portal
              access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteClient}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </DashboardLayout>
  );
};

export default ClientsPage;
