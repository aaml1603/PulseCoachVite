import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Dumbbell,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  MessageSquare,
} from "lucide-react";
import CoachProfileCard from "@/components/client-portal/CoachProfileCard";

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  coach_id?: string;
  user_id?: string; // Added user_id as an alternative to coach_id
}

interface Workout {
  id: string;
  user_id: string;
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

interface ProgressMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  date: string;
}

export default function ClientPortal() {
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get("code");
  const { toast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetric[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);

  // Verify access code and load client data
  useEffect(() => {
    const verifyAccess = async () => {
      if (!clientId) return;

      try {
        setIsLoading(true);
        console.log("Verifying access for client ID:", clientId);

        // Check if access code is valid
        const { data: portalData, error: portalError } = await supabase
          .from("client_portals")
          .select("*")
          .eq("client_id", clientId)
          .single();

        if (portalError || !portalData) {
          console.error("Portal not found:", portalError);
          setIsLoading(false);
          return;
        }

        console.log("Portal data found:", portalData);

        // If access code is provided in URL and matches
        if (accessCode && accessCode === portalData.access_code) {
          console.log("Access code verified successfully");
          setIsAuthenticated(true);
          await loadClientData();

          // Update last accessed timestamp
          await supabase
            .from("client_portals")
            .update({ last_accessed: new Date().toISOString() })
            .eq("id", portalData.id);
        } else {
          console.log("Access code verification failed or not provided");
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
      console.log("Loading client data for ID:", clientId);
      // Load client info
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, name, email, coach_id, user_id")
        .eq("id", clientId)
        .single();

      if (clientError) {
        console.error("Client not found:", clientError);
        // Try to get client portal data to see if the client exists
        const { data: portalData } = await supabase
          .from("client_portals")
          .select("client_id")
          .eq("client_id", clientId)
          .single();

        if (!portalData) {
          console.error("Client portal not found for ID:", clientId);
          throw new Error("Client not found");
        }
      }

      // If we have client data, use it
      if (clientData) {
        console.log("Client data loaded:", clientData);
        setClient(clientData);
      } else {
        // Try to get client name from portal data
        console.log("Fetching client name from portal data for ID:", clientId);
        const { data: portalClientData } = await supabase
          .from("client_portals")
          .select("client_name, client_email")
          .eq("client_id", clientId)
          .single();

        // Create client with real data or fallback
        const defaultClient = {
          id: clientId,
          name: portalClientData?.client_name || "Client",
          email: portalClientData?.client_email || "client@example.com",
          user_id: null,
          coach_id: null,
        };
        setClient(defaultClient);
      }

      // Set coach ID for profile display (try coach_id first, then user_id)
      const currentClient = clientData || { coach_id: null, user_id: null };
      if (currentClient.coach_id) {
        console.log("Setting coach ID from coach_id:", currentClient.coach_id);
        setCoachId(currentClient.coach_id);
      } else if (currentClient.user_id) {
        console.log("Setting coach ID from user_id:", currentClient.user_id);
        setCoachId(currentClient.user_id);
      } else {
        console.log("No coach_id or user_id found in client data");
        // Fetch coach ID from a different source if needed
        try {
          const { data: coachData, error: coachError } = await supabase
            .from("coach_profiles")
            .select("id, user_id")
            .limit(1);

          if (coachData && coachData.length > 0) {
            console.log("Found coach from coach_profiles:", coachData[0]);
            setCoachId(coachData[0].id);
          } else if (coachError) {
            console.error("Error fetching coach profile:", coachError);
          }
        } catch (err) {
          console.error("Error in coach fallback fetch:", err);
        }
      }

      // Load workouts with more detailed logging
      console.log("Fetching workouts for client ID:", clientId);
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("client_id", clientId);

      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        // Don't throw error, just log it and continue with empty workouts
      }

      console.log("Workouts fetched:", workoutsData);
      setWorkouts(workoutsData || []);

      // Load progress metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("progress_metrics")
        .select("*")
        .eq("client_id", clientId);

      if (metricsError) {
        console.error("Error fetching progress metrics:", metricsError);
        // Don't throw error, just log it and continue with empty metrics
      }
      setProgressMetrics(metricsData || []);
    } catch (error) {
      console.error("Error loading client data:", error);
      toast({
        title: "Error loading data",
        description: "There was a problem loading your information.",
        variant: "destructive",
      });
    } finally {
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

  // State for feedback modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null,
  );
  const [workoutFeedback, setWorkoutFeedback] = useState("");

  // Mark workout as complete
  const markWorkoutComplete = async (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setFeedbackModalOpen(true);
  };

  // Submit workout completion with feedback
  const submitWorkoutCompletion = async () => {
    if (!selectedWorkoutId) return;

    try {
      // Update workout status
      const { error: workoutError } = await supabase
        .from("workouts")
        .update({
          status: "completed",
          feedback: workoutFeedback,
        })
        .eq("id", selectedWorkoutId);

      if (workoutError) throw workoutError;

      // Create notification for coach
      const workout = workouts.find((w) => w.id === selectedWorkoutId);
      if (workout) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert([
            {
              user_id: workout.user_id,
              client_id: clientId,
              title: "Workout Completed",
              message: `${client?.name} completed the workout: ${workout.title}${workoutFeedback ? " and left feedback" : ""}.`,
              type: "workout_completed",
              read: false,
            },
          ]);

        if (notificationError)
          console.error("Error creating notification:", notificationError);
      }

      // Update local state
      setWorkouts(
        workouts.map((workout) =>
          workout.id === selectedWorkoutId
            ? { ...workout, status: "completed", feedback: workoutFeedback }
            : workout,
        ),
      );

      // Reset state
      setFeedbackModalOpen(false);
      setSelectedWorkoutId(null);
      setWorkoutFeedback("");

      toast({
        title: "Workout Completed",
        description: "Great job! Your workout has been marked as complete.",
      });
    } catch (error) {
      console.error("Error marking workout complete:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating your workout status.",
        variant: "destructive",
      });
    }
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

  // Get all assigned workouts (not completed)
  const getAssignedWorkouts = () => {
    console.log("Getting assigned workouts from total:", workouts.length);

    const assigned = workouts
      .filter((workout) => workout.status !== "completed")
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
      );
    console.log("Assigned workouts:", assigned.length);
    return assigned;
  };

  // Get completed workouts
  const getCompletedWorkouts = () => {
    return workouts
      .filter((workout) => workout.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.due_date).getTime() - new Date(a.due_date).getTime(),
      );
  };

  // Get progress metrics by type
  const getProgressMetricsByType = (metricType: string) => {
    return progressMetrics
      .filter((metric) => metric.metric_type === metricType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Calculate completion rate
  const getCompletionRate = () => {
    if (workouts.length === 0) return 0;
    const completedCount = workouts.filter(
      (w) => w.status === "completed",
    ).length;
    return Math.round((completedCount / workouts.length) * 100);
  };

  // If not authenticated, show access code form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Client Portal Access</CardTitle>
            <CardDescription>
              Enter your access code to view your personalized fitness program.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                  Access Portal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  // Main portal view after authentication
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl text-blue-600">
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
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading your fitness program...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Coach Profile */}
            {coachId && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-4">Your Coach</h3>
                <CoachProfileCard coachId={coachId} />
              </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getCompletionRate()}%
                  </div>
                  <Progress value={getCompletionRate()} className="h-2 mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Assigned Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getAssignedWorkouts().length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getAssignedWorkouts().length > 0
                      ? `Next due: ${formatDate(getAssignedWorkouts()[0].due_date)}`
                      : "No assigned workouts"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Completed Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getCompletedWorkouts().length}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getCompletedWorkouts().length > 0
                      ? `Last completed: ${formatDate(getCompletedWorkouts()[0].due_date)}`
                      : "No completed workouts yet"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="workouts" className="w-full">
              <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-3">
                <TabsTrigger value="workouts" className="flex items-center">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  <span>My Workouts</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex items-center">
                  <LineChart className="mr-2 h-4 w-4" />
                  <span>My Progress</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </TabsTrigger>
              </TabsList>

              {/* Workouts Tab */}
              <TabsContent value="workouts" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Assigned Workouts</h3>
                  {getAssignedWorkouts().length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-lg font-medium">
                          No assigned workouts
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          No workouts have been assigned to you yet.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {getAssignedWorkouts().map((workout) => (
                        <Card key={workout.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle>{workout.title}</CardTitle>
                              <Badge
                                variant={
                                  workout.status === "in_progress"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {workout.status === "in_progress"
                                  ? "In Progress"
                                  : "Assigned"}
                              </Badge>
                            </div>
                            <CardDescription>
                              Due: {formatDate(workout.due_date)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {workout.description && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {workout.description}
                              </p>
                            )}

                            {/* Display exercises if available */}
                            {workout.exercises &&
                            workout.exercises.length > 0 ? (
                              <div className="space-y-4">
                                <h4 className="text-sm font-medium">
                                  Exercises
                                </h4>
                                <div className="space-y-3">
                                  {workout.exercises.map((exercise) => (
                                    <div
                                      key={exercise.id}
                                      className="p-3 border border-border rounded-md"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium">
                                          {exercise.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {exercise.sets} sets × {exercise.reps}{" "}
                                          reps
                                        </div>
                                      </div>
                                      {exercise.notes && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {exercise.notes}
                                        </p>
                                      )}
                                      <div className="text-xs text-muted-foreground mt-2 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Rest: {exercise.rest_seconds} seconds
                                        between sets
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground mb-4">
                                No exercises have been added to this workout
                                yet.
                              </div>
                            )}

                            {/* Always show the complete button */}
                            <Button
                              className="w-full mt-4"
                              onClick={() => markWorkoutComplete(workout.id)}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Complete
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Completed Workouts</h3>
                  {getCompletedWorkouts().length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="text-lg font-medium">
                          No completed workouts yet
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Your completed workouts will appear here.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {getCompletedWorkouts()
                        .slice(0, 5)
                        .map((workout) => (
                          <Card key={workout.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle>{workout.title}</CardTitle>
                                <Badge variant="default">Completed</Badge>
                              </div>
                              <CardDescription>
                                Completed on {formatDate(workout.due_date)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {workout.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                  {workout.description}
                                </p>
                              )}

                              {workout.exercises &&
                                workout.exercises.length > 0 && (
                                  <div>
                                    <Button
                                      variant="outline"
                                      className="w-full"
                                    >
                                      View Workout Details
                                    </Button>
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-6 pt-6">
                {progressMetrics.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">
                        No progress data yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your coach will add progress measurements here as you
                        continue your fitness journey.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    {/* Weight Progress */}
                    {getProgressMetricsByType("weight").length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Weight Progress</CardTitle>
                          <CardDescription>
                            Track your weight changes over time.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px] bg-muted rounded-md flex items-center justify-center mb-4">
                            <p className="text-muted-foreground">
                              Weight chart visualization would appear here
                            </p>
                          </div>

                          <div className="space-y-2">
                            {getProgressMetricsByType("weight")
                              .slice(-5)
                              .reverse()
                              .map((metric, index, array) => (
                                <div
                                  key={metric.id}
                                  className="flex items-center justify-between p-3 border border-border rounded-md"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {formatDate(metric.date)}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="font-medium">
                                      {metric.value} {metric.unit}
                                    </div>
                                    {index < array.length - 1 && (
                                      <Badge
                                        variant={
                                          metric.value < array[index + 1].value
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="ml-2"
                                      >
                                        {metric.value <
                                        array[index + 1].value ? (
                                          <ArrowDownRight className="h-3 w-3 mr-1" />
                                        ) : (
                                          <ArrowUpRight className="h-3 w-3 mr-1" />
                                        )}
                                        {Math.abs(
                                          metric.value - array[index + 1].value,
                                        ).toFixed(1)}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Other Measurements */}
                    {[
                      "body_fat",
                      "chest",
                      "waist",
                      "hips",
                      "arms",
                      "thighs",
                    ].map(
                      (metricType) =>
                        getProgressMetricsByType(metricType).length > 0 && (
                          <Card key={metricType}>
                            <CardHeader>
                              <CardTitle>
                                {metricType
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  )
                                  .join(" ")}{" "}
                                Measurements
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {getProgressMetricsByType(metricType)
                                  .slice(-5)
                                  .reverse()
                                  .map((metric, index, array) => (
                                    <div
                                      key={metric.id}
                                      className="flex items-center justify-between p-3 border border-border rounded-md"
                                    >
                                      <div className="font-medium">
                                        {formatDate(metric.date)}
                                      </div>
                                      <div className="flex items-center">
                                        <div className="font-medium">
                                          {metric.value} {metric.unit}
                                        </div>
                                        {index < array.length - 1 && (
                                          <Badge
                                            variant={
                                              metric.value <
                                              array[index + 1].value
                                                ? "default"
                                                : "secondary"
                                            }
                                            className="ml-2"
                                          >
                                            {metric.value <
                                            array[index + 1].value ? (
                                              <ArrowDownRight className="h-3 w-3 mr-1" />
                                            ) : (
                                              <ArrowUpRight className="h-3 w-3 mr-1" />
                                            )}
                                            {Math.abs(
                                              metric.value -
                                                array[index + 1].value,
                                            ).toFixed(1)}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        ),
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-6 pt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">
                        Message Your Coach
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Have questions or need guidance? Send a message to your
                        coach.
                      </p>
                      <Button
                        onClick={() =>
                          (window.location.href = `/client-messaging/${clientId}?code=${accessCode}`)
                        }
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Open Messaging
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <footer className="bg-background border-t border-border py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FitCoach Pro. All rights reserved.
        </div>
      </footer>

      {/* Feedback Dialog */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Workout</DialogTitle>
            <DialogDescription>
              Great job! Would you like to leave any feedback for your coach
              about this workout?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="How did this workout feel? Any challenges or achievements you'd like to share?"
            value={workoutFeedback}
            onChange={(e) => setWorkoutFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setFeedbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitWorkoutCompletion}>Submit & Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
