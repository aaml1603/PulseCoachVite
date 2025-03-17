import React from "react";
import { useEffect, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import ClientMetrics from "@/components/dashboard/ClientMetrics";
import MessagingSystem from "@/components/dashboard/MessagingSystem";
import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import {
  Users,
  Dumbbell,
  LineChart,
  Bell,
  Plus,
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Link as LinkIcon,
  Copy,
  Check,
  MessageSquare,
  User,
} from "lucide-react";

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

interface Workout {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: string;
  due_date: string;
  created_at: string;
  exercises: Exercise[];
  feedback?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  notes?: string;
}

interface ClientPortal {
  id: string;
  client_id: string;
  access_code: string;
  url: string;
  created_at: string;
  last_accessed?: string;
}

interface ProgressMetric {
  id: string;
  client_id: string;
  metric_type: string;
  value: number;
  unit: string;
  date: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [clientPortals, setClientPortals] = useState<ClientPortal[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);
  const [loading, setLoading] = useState({
    clients: true,
    workouts: true,
    portals: true,
    metrics: true,
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [newWorkoutData, setNewWorkoutData] = useState({
    title: "",
    description: "",
    client_id: "",
    due_date: new Date().toISOString().split("T")[0],
  });
  const [copiedPortalId, setCopiedPortalId] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchClients();
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
        fetchProgressMetrics(data.map((client) => client.id));
      } else {
        setLoading((prev) => ({
          ...prev,
          clients: false,
          workouts: false,
          portals: false,
          metrics: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error fetching clients",
        description: "There was a problem loading your clients.",
        variant: "destructive",
      });
      setLoading((prev) => ({ ...prev, clients: false }));
    } finally {
      // Ensure loading state is set to false even if there's an error
      setLoading((prev) => ({ ...prev, clients: false }));
    }
  };

  // Fetch workouts from database
  const fetchWorkouts = async () => {
    try {
      setLoading((prev) => ({ ...prev, workouts: true }));
      const { data, error } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
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

  // Fetch progress metrics from database
  const fetchProgressMetrics = async (clientIds: string[]) => {
    if (!clientIds || !clientIds.length) {
      setLoading((prev) => ({ ...prev, metrics: false }));
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, metrics: true }));
      const { data, error } = await supabase
        .from("progress_metrics")
        .select("*")
        .in("client_id", clientIds);

      if (error) throw error;
      setProgressMetrics(data || []);
    } catch (error) {
      console.error("Error fetching progress metrics:", error);
      toast({
        title: "Error fetching progress metrics",
        description: "There was a problem loading your progress metrics.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, metrics: false }));
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

      // Update clients state directly with the new client to avoid loading state issues
      if (data && data.length > 0) {
        setClients((prevClients) => [...prevClients, data[0]]);
        // Then fetch all related data
        fetchWorkouts();
        fetchClientPortals([...clients.map((client) => client.id), data[0].id]);
        fetchProgressMetrics([
          ...clients.map((client) => client.id),
          data[0].id,
        ]);
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

  // Add new workout
  const addNewWorkout = async () => {
    try {
      if (!newWorkoutData.title || !newWorkoutData.client_id) {
        toast({
          title: "Missing information",
          description:
            "Please provide a title and select a client for the workout.",
          variant: "destructive",
        });
        return;
      }

      console.log("Adding new workout:", {
        user_id: user?.id,
        client_id: newWorkoutData.client_id,
        title: newWorkoutData.title,
        description: newWorkoutData.description,
        status: "assigned",
        due_date: newWorkoutData.due_date,
      });

      const { data, error } = await supabase
        .from("workouts")
        .insert([
          {
            user_id: user?.id,
            client_id: newWorkoutData.client_id,
            title: newWorkoutData.title,
            description: newWorkoutData.description,
            status: "assigned",
            due_date: newWorkoutData.due_date,
          },
        ])
        .select();

      if (error) {
        console.error("Database error adding workout:", error);
        throw error;
      }

      console.log("Workout added successfully:", data);

      toast({
        title: "Workout added",
        description: `${newWorkoutData.title} has been assigned to the client.`,
      });

      // Reset form and refresh workouts
      setNewWorkoutData({
        title: "",
        description: "",
        client_id: "",
        due_date: new Date().toISOString().split("T")[0],
      });
      fetchWorkouts();

      // Create notification for client about new workout
      try {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert([
            {
              user_id: user?.id,
              client_id: newWorkoutData.client_id,
              title: "New Workout Assigned",
              message: `A new workout "${newWorkoutData.title}" has been assigned to you.`,
              type: "workout_assigned",
              read: false,
            },
          ]);

        if (notificationError) {
          console.error("Error creating notification:", notificationError);
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
    } catch (error) {
      console.error("Error adding workout:", error);
      toast({
        title: "Error adding workout",
        description: "There was a problem adding the workout.",
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

  // Get client's upcoming workouts
  const getUpcomingWorkouts = (clientId: string) => {
    // Fix date comparison by using start of day for both dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return workouts
      .filter((workout) => {
        const isClientWorkout = workout.client_id === clientId;
        const isNotCompleted = workout.status !== "completed";

        // Parse the due date and set to start of day for fair comparison
        const dueDate = new Date(workout.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const isDueInFuture = dueDate >= today;

        return isClientWorkout && isNotCompleted && isDueInFuture;
      })
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );
  };

  // Get client's progress metrics
  const getClientProgressMetrics = (clientId: string, metricType: string) => {
    return progressMetrics
      .filter(
        (metric) =>
          metric.client_id === clientId && metric.metric_type === metricType,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your clients, workouts, and track progress.
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

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workout</DialogTitle>
                    <DialogDescription>
                      Create a workout and assign it to a client.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Workout Title</Label>
                      <Input
                        id="title"
                        value={newWorkoutData.title}
                        onChange={(e) =>
                          setNewWorkoutData({
                            ...newWorkoutData,
                            title: e.target.value,
                          })
                        }
                        placeholder="Full Body Strength"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={newWorkoutData.description}
                        onChange={(e) =>
                          setNewWorkoutData({
                            ...newWorkoutData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Focus on compound movements with moderate weight."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client">Assign to Client</Label>
                      <select
                        id="client"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newWorkoutData.client_id}
                        onChange={(e) =>
                          setNewWorkoutData({
                            ...newWorkoutData,
                            client_id: e.target.value,
                          })
                        }
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newWorkoutData.due_date}
                        onChange={(e) =>
                          setNewWorkoutData({
                            ...newWorkoutData,
                            due_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addNewWorkout}>Create Workout</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Dashboard Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clients
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {clients.filter((c) => c.status === "active").length} active
                  clients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workouts
                </CardTitle>
                <Dumbbell className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workouts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {workouts.filter((w) => w.status === "completed").length}{" "}
                  completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Compliance
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.length > 0
                    ? Math.round(
                        clients.reduce(
                          (acc, client) =>
                            acc + getClientComplianceRate(client.id),
                          0,
                        ) / clients.length,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all clients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Portals
                </CardTitle>
                <LinkIcon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clientPortals.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {clients.length > 0
                    ? Math.round((clientPortals.length / clients.length) * 100)
                    : 0}
                  % of clients
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-4">
              <TabsTrigger value="clients" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Clients</span>
              </TabsTrigger>
              <TabsTrigger value="workouts" className="flex items-center">
                <Dumbbell className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center">
                <LineChart className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="portals" className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Portals</span>
              </TabsTrigger>
            </TabsList>

            {/* Clients Tab */}
            <TabsContent value="clients" className="space-y-4">
              <div className="rounded-md border border-border">
                <div className="p-4 bg-background rounded-md">
                  <div className="font-medium">Your Clients</div>
                  <div className="text-sm text-muted-foreground">
                    Manage and view details of all your clients.
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0 bg-background">
                      {loading.clients ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">
                            Loading clients...
                          </td>
                        </tr>
                      ) : clients.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">
                            No clients found. Add your first client to get
                            started.
                          </td>
                        </tr>
                      ) : (
                        clients.map((client) => (
                          <tr
                            key={client.id}
                            className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                            onClick={() => setSelectedClient(client)}
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
                                  client.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {client.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex items-center space-x-2">
                                <Progress
                                  value={getClientComplianceRate(client.id)}
                                  className="h-2 w-[60px]"
                                />
                                <span>
                                  {getClientComplianceRate(client.id)}%
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
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
                          <CardDescription>
                            {selectedClient.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedClient(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview">
                      <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="workouts">Workouts</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="messaging">Messaging</TabsTrigger>
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
                                value={getClientComplianceRate(
                                  selectedClient.id,
                                )}
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
                              <CardTitle className="text-sm">
                                Client Since
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {formatDate(selectedClient.created_at)}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Upcoming Workouts
                          </h3>
                          {getUpcomingWorkouts(selectedClient.id).length ===
                          0 ? (
                            <p className="text-sm text-muted-foreground">
                              No upcoming workouts scheduled.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {getUpcomingWorkouts(selectedClient.id)
                                .slice(0, 3)
                                .map((workout) => (
                                  <div
                                    key={workout.id}
                                    className="flex items-center justify-between p-3 border border-border rounded-md bg-card text-card-foreground"
                                  >
                                    <div>
                                      <div className="font-medium">
                                        {workout.title}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        Due: {formatDate(workout.due_date)}
                                      </div>
                                    </div>
                                    <Badge
                                      variant={
                                        workout.status === "assigned"
                                          ? "outline"
                                          : "secondary"
                                      }
                                    >
                                      {workout.status === "assigned"
                                        ? "Assigned"
                                        : "In Progress"}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <h3 className="text-lg font-medium mb-2">
                            Client Portal
                          </h3>
                          {clientPortals.find(
                            (portal) => portal.client_id === selectedClient.id,
                          ) ? (
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
                                  if (portal)
                                    copyPortalLink(portal.url, portal.id);
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
                          ) : (
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-muted-foreground">
                                No portal generated yet.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  generateClientPortal(selectedClient.id)
                                }
                              >
                                Generate Portal
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent
                        value="workouts"
                        className="space-y-4 pt-4"
                        id="client-workouts-tab"
                      >
                        {workouts.filter(
                          (w) => w.client_id === selectedClient.id,
                        ).length === 0 ? (
                          <div className="text-center py-8">
                            <Dumbbell className="h-12 w-12 text-muted mx-auto mb-4" />
                            <h3 className="text-lg font-medium">
                              No workouts assigned
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Create your first workout for this client.
                            </p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Workout
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create New Workout</DialogTitle>
                                  <DialogDescription>
                                    Create a workout for {selectedClient.name}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="title">Workout Title</Label>
                                    <Input
                                      id="title"
                                      value={newWorkoutData.title}
                                      onChange={(e) =>
                                        setNewWorkoutData({
                                          ...newWorkoutData,
                                          title: e.target.value,
                                        })
                                      }
                                      placeholder="Full Body Strength"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="description">
                                      Description (optional)
                                    </Label>
                                    <Textarea
                                      id="description"
                                      value={newWorkoutData.description}
                                      onChange={(e) =>
                                        setNewWorkoutData({
                                          ...newWorkoutData,
                                          description: e.target.value,
                                        })
                                      }
                                      placeholder="Focus on compound movements with moderate weight."
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="due_date">Due Date</Label>
                                    <Input
                                      id="due_date"
                                      type="date"
                                      value={newWorkoutData.due_date}
                                      onChange={(e) =>
                                        setNewWorkoutData({
                                          ...newWorkoutData,
                                          due_date: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      setNewWorkoutData({
                                        ...newWorkoutData,
                                        client_id: selectedClient.id,
                                      });
                                      addNewWorkout();
                                    }}
                                  >
                                    Create Workout
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {workouts
                              .filter((w) => w.client_id === selectedClient.id)
                              .sort(
                                (a, b) =>
                                  new Date(b.created_at).getTime() -
                                  new Date(a.created_at).getTime(),
                              )
                              .map((workout) => (
                                <Card
                                  key={workout.id}
                                  id={`workout-${workout.id}`}
                                  className={
                                    workout.status === "completed" &&
                                    workout.feedback
                                      ? "ring-2 ring-blue-200"
                                      : ""
                                  }
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle>{workout.title}</CardTitle>
                                      <Badge
                                        variant={
                                          workout.status === "completed"
                                            ? "default"
                                            : "outline"
                                        }
                                      >
                                        {workout.status === "completed"
                                          ? "Completed"
                                          : workout.status === "in_progress"
                                            ? "In Progress"
                                            : "Assigned"}
                                      </Badge>
                                    </div>
                                    <CardDescription>
                                      Created on{" "}
                                      {formatDate(workout.created_at)} • Due{" "}
                                      {formatDate(workout.due_date)}
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    {workout.description && (
                                      <p className="text-sm text-muted-foreground mb-4">
                                        {workout.description}
                                      </p>
                                    )}

                                    {workout.feedback && (
                                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-100 dark:border-blue-800">
                                        <h4 className="text-sm font-medium mb-1 flex items-center">
                                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                          Client Feedback:
                                        </h4>
                                        <p className="text-sm text-foreground">
                                          {workout.feedback}
                                        </p>
                                      </div>
                                    )}

                                    {workout.exercises &&
                                    workout.exercises.length > 0 ? (
                                      <div className="space-y-2">
                                        <h4 className="text-sm font-medium">
                                          Exercises
                                        </h4>
                                        <div className="space-y-2">
                                          {workout.exercises.map(
                                            (exercise, index) => (
                                              <div
                                                key={exercise.id}
                                                className="p-2 border border-border rounded-md bg-card text-card-foreground"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <div className="font-medium">
                                                    {exercise.name}
                                                  </div>
                                                  <div className="text-sm text-muted-foreground">
                                                    {exercise.sets} sets ×{" "}
                                                    {exercise.reps} reps
                                                  </div>
                                                </div>
                                                {exercise.notes && (
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    {exercise.notes}
                                                  </p>
                                                )}
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        No exercises added to this workout yet.
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="progress" className="space-y-4 pt-4">
                        <ClientMetrics
                          clientId={selectedClient.id}
                          clientName={selectedClient.name}
                        />
                      </TabsContent>

                      <TabsContent value="messaging" className="pt-4">
                        <MessagingSystem
                          clientId={selectedClient.id}
                          clientName={selectedClient.name}
                          clientEmail={selectedClient.email}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Workouts Tab */}
            <TabsContent value="workouts" className="space-y-4">
              <div className="rounded-md border border-border">
                <div className="p-4 bg-background rounded-md">
                  <div className="font-medium">All Workouts</div>
                  <div className="text-sm text-muted-foreground">
                    View and manage all client workouts.
                  </div>
                </div>
                <div className="relative w-full overflow-auto bg-background">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Title
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Client
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Due Date
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Status
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0 bg-background">
                      {loading.workouts ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">
                            Loading workouts...
                          </td>
                        </tr>
                      ) : workouts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center">
                            No workouts found. Create your first workout to get
                            started.
                          </td>
                        </tr>
                      ) : (
                        workouts.map((workout) => {
                          const client = clients.find(
                            (c) => c.id === workout.client_id,
                          );
                          return (
                            <tr
                              key={workout.id}
                              className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">
                                {workout.title}
                              </td>
                              <td className="p-4 align-middle">
                                {client ? (
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.email}`}
                                      />
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{client.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Unknown client
                                  </span>
                                )}
                              </td>
                              <td className="p-4 align-middle">
                                {formatDate(workout.due_date)}
                              </td>
                              <td className="p-4 align-middle">
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
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Edit</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Progress Overview</CardTitle>
                    <CardDescription>
                      Track progress metrics across all clients.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading.metrics ? (
                      <div className="py-8 text-center">
                        Loading progress data...
                      </div>
                    ) : progressMetrics.length === 0 ? (
                      <div className="py-8 text-center">
                        <LineChart className="h-12 w-12 text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-medium">
                          No progress data yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Progress metrics will appear here once recorded.
                        </p>
                      </div>
                    ) : (
                      <div className="h-[300px] bg-muted/30 dark:bg-muted/10 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Progress visualization would appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Rates</CardTitle>
                    <CardDescription>
                      Client workout completion rates.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading.clients || loading.workouts ? (
                      <div className="py-8 text-center">
                        Loading compliance data...
                      </div>
                    ) : clients.length === 0 ? (
                      <div className="py-8 text-center">
                        <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No clients yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Add clients to see compliance rates.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clients
                          .filter((client) =>
                            workouts.some((w) => w.client_id === client.id),
                          )
                          .sort(
                            (a, b) =>
                              getClientComplianceRate(b.id) -
                              getClientComplianceRate(a.id),
                          )
                          .slice(0, 5)
                          .map((client) => (
                            <div key={client.id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client.email}`}
                                    />
                                    <AvatarFallback>
                                      <User className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {client.name}
                                  </span>
                                </div>
                                <span className="text-sm">
                                  {getClientComplianceRate(client.id)}%
                                </span>
                              </div>
                              <Progress
                                value={getClientComplianceRate(client.id)}
                                className="h-2"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Portals Tab */}
            <TabsContent value="portals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Portals</CardTitle>
                  <CardDescription>
                    Manage access links for your clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.portals ? (
                    <div className="py-8 text-center">
                      Loading portal data...
                    </div>
                  ) : clientPortals.length === 0 ? (
                    <div className="text-center py-8">
                      <LinkIcon className="h-12 w-12 text-muted mx-auto mb-4" />
                      <h3 className="text-lg font-medium">
                        No client portals yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate portals for your clients to access their
                        workouts.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clientPortals.map((portal) => {
                        const client = clients.find(
                          (c) => c.id === portal.client_id,
                        );
                        return (
                          <div
                            key={portal.id}
                            className="flex items-center justify-between p-4 border border-border rounded-md bg-card text-card-foreground"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${client?.email}`}
                                  alt={client?.name}
                                />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {client?.name || "Unknown Client"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Created: {formatDate(portal.created_at)}
                                  {portal.last_accessed &&
                                    ` • Last accessed: ${formatDate(portal.last_accessed)}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  copyPortalLink(portal.url, portal.id)
                                }
                              >
                                {copiedPortalId === portal.id ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Link
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </DashboardLayout>
  );
};

export default Dashboard;
