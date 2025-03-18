import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Users,
  Dumbbell,
  LineChart,
  Bell,
  Calendar,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Link as LinkIcon,
  User,
  TrendingUp,
  Clock,
} from "lucide-react";

// Import the chart components
import ClientActivityChart from "@/components/dashboard/ClientActivityChart";
import ComplianceRateChart from "@/components/dashboard/ComplianceRateChart";
import WorkoutDistributionChart from "@/components/dashboard/WorkoutDistributionChart";
import ClientProgressChart from "@/components/dashboard/ClientProgressChart";
import TopClientsTable from "@/components/dashboard/TopClientsTable";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";

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
  const { user } = useAuth();
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
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeClients: 0,
    totalWorkouts: 0,
    completedWorkouts: 0,
    complianceRate: 0,
    upcomingWorkouts: 0,
    trends: {
      clients: 0,
      workouts: 0,
      completedWorkouts: 0,
      complianceRate: 0,
      avgCompletionTime: 0,
    },
  });
  const [topClients, setTopClients] = useState([]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchDashboardData();
    }
  }, [user, navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading({
        clients: true,
        workouts: true,
        portals: true,
        metrics: true,
      });

      // Get current date and 30 days ago for trend calculations
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

      // Fetch clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user?.id);

      if (clientsError) throw clientsError;
      setClients(clients || []);

      // Fetch clients created in last 30 days for trend
      const { data: newClients, error: newClientsError } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user?.id)
        .gte("created_at", thirtyDaysAgoStr);

      if (newClientsError) throw newClientsError;

      // Fetch workouts
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("user_id", user?.id);

      if (workoutsError) throw workoutsError;
      setWorkouts(workouts || []);

      // Fetch workouts created in last 30 days for trend
      const { data: newWorkouts, error: newWorkoutsError } = await supabase
        .from("workouts")
        .select("id, status, created_at, completed_at")
        .eq("user_id", user?.id)
        .gte("created_at", thirtyDaysAgoStr);

      if (newWorkoutsError) throw newWorkoutsError;

      // Fetch client portals
      if (clients && clients.length > 0) {
        const { data: portals, error: portalsError } = await supabase
          .from("client_portals")
          .select("*")
          .in(
            "client_id",
            clients.map((client) => client.id),
          );

        if (portalsError) throw portalsError;
        setClientPortals(portals || []);
      }

      // Fetch progress metrics
      if (clients && clients.length > 0) {
        const { data: metrics, error: metricsError } = await supabase
          .from("progress_metrics")
          .select("*")
          .in(
            "client_id",
            clients.map((client) => client.id),
          );

        if (metricsError) throw metricsError;
        setProgressMetrics(metrics || []);
      }

      // Calculate dashboard metrics
      const activeClients = clients.filter(
        (client) => client.status === "active",
      ).length;

      const completedWorkouts = workouts.filter(
        (workout) => workout.status === "completed",
      ).length;

      // Calculate upcoming workouts (due in the next 7 days)
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const upcomingWorkouts = workouts.filter((workout) => {
        const dueDate = new Date(workout.due_date);
        return (
          workout.status !== "completed" &&
          dueDate >= today &&
          dueDate <= nextWeek
        );
      }).length;

      const complianceRate =
        workouts.length > 0
          ? Math.round((completedWorkouts / workouts.length) * 100)
          : 0;

      // Calculate trends (percentage change in last 30 days)
      // Get data from 60 days ago for comparison
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);
      const sixtyDaysAgoStr = sixtyDaysAgo.toISOString();

      // Fetch clients created between 30-60 days ago for comparison
      const { data: previousPeriodClients, error: prevClientsError } =
        await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user?.id)
          .gte("created_at", sixtyDaysAgoStr)
          .lt("created_at", thirtyDaysAgoStr);

      if (prevClientsError)
        console.error(
          "Error fetching previous period clients:",
          prevClientsError,
        );

      // Fetch workouts created between 30-60 days ago for comparison
      const { data: previousPeriodWorkouts, error: prevWorkoutsError } =
        await supabase
          .from("workouts")
          .select("id, status, created_at, completed_at")
          .eq("user_id", user?.id)
          .gte("created_at", sixtyDaysAgoStr)
          .lt("created_at", thirtyDaysAgoStr);

      if (prevWorkoutsError)
        console.error(
          "Error fetching previous period workouts:",
          prevWorkoutsError,
        );

      // For clients: compare new clients in last 30 days with previous 30 days
      const clientTrend =
        previousPeriodClients && previousPeriodClients.length > 0
          ? Math.round(
              ((newClients?.length - previousPeriodClients.length) /
                previousPeriodClients.length) *
                100,
            )
          : null; // null indicates no previous data to compare

      // For workouts: compare new workouts in last 30 days with previous 30 days
      const workoutTrend =
        previousPeriodWorkouts && previousPeriodWorkouts.length > 0
          ? Math.round(
              ((newWorkouts?.length - previousPeriodWorkouts.length) /
                previousPeriodWorkouts.length) *
                100,
            )
          : null;

      // For completed workouts: compare completed workouts in last 30 days with previous 30 days
      const newCompletedWorkouts =
        newWorkouts?.filter((w) => w.status === "completed").length || 0;
      const prevCompletedWorkouts =
        previousPeriodWorkouts?.filter((w) => w.status === "completed")
          .length || 0;

      const completedWorkoutTrend =
        prevCompletedWorkouts > 0
          ? Math.round(
              ((newCompletedWorkouts - prevCompletedWorkouts) /
                prevCompletedWorkouts) *
                100,
            )
          : null;

      // For compliance rate: compare current period compliance rate with previous period
      const newWorkoutsComplianceRate =
        newWorkouts?.length > 0
          ? Math.round((newCompletedWorkouts / newWorkouts.length) * 100)
          : 0;

      const prevWorkoutsComplianceRate =
        previousPeriodWorkouts?.length > 0
          ? Math.round(
              (prevCompletedWorkouts / previousPeriodWorkouts.length) * 100,
            )
          : 0;

      const complianceRateTrend =
        prevWorkoutsComplianceRate > 0
          ? newWorkoutsComplianceRate - prevWorkoutsComplianceRate
          : null;

      // Calculate average completion time (in days)
      const completionTimes = workouts
        .filter(
          (workout) => workout.status === "completed" && workout.completed_at,
        )
        .map((workout) => {
          const createdDate = new Date(workout.created_at);
          const completedDate = new Date(workout.completed_at);
          return Math.round(
            (completedDate.getTime() - createdDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
        });

      const avgCompletionTime =
        completionTimes.length > 0
          ? (
              completionTimes.reduce((sum, time) => sum + time, 0) /
              completionTimes.length
            ).toFixed(1)
          : 0;

      // Calculate trend for completion time
      const recentCompletionTimes = workouts
        .filter(
          (workout) =>
            workout.status === "completed" &&
            workout.completed_at &&
            new Date(workout.created_at) >= thirtyDaysAgo,
        )
        .map((workout) => {
          const createdDate = new Date(workout.created_at);
          const completedDate = new Date(workout.completed_at);
          return Math.round(
            (completedDate.getTime() - createdDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
        });

      // Calculate previous period completion times
      const previousPeriodCompletionTimes = workouts
        .filter(
          (workout) =>
            workout.status === "completed" &&
            workout.completed_at &&
            new Date(workout.created_at) >= sixtyDaysAgo &&
            new Date(workout.created_at) < thirtyDaysAgo,
        )
        .map((workout) => {
          const createdDate = new Date(workout.created_at);
          const completedDate = new Date(workout.completed_at);
          return Math.round(
            (completedDate.getTime() - createdDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
        });

      const recentAvgCompletionTime =
        recentCompletionTimes.length > 0
          ? recentCompletionTimes.reduce((sum, time) => sum + time, 0) /
            recentCompletionTimes.length
          : 0;

      const previousAvgCompletionTime =
        previousPeriodCompletionTimes.length > 0
          ? previousPeriodCompletionTimes.reduce((sum, time) => sum + time, 0) /
            previousPeriodCompletionTimes.length
          : 0;

      const avgCompletionTimeTrend =
        previousAvgCompletionTime > 0
          ? Math.round(
              ((recentAvgCompletionTime - previousAvgCompletionTime) /
                previousAvgCompletionTime) *
                100,
            )
          : null;

      // Set dashboard data
      setDashboardData({
        totalClients: clients.length,
        activeClients,
        totalWorkouts: workouts.length,
        completedWorkouts,
        complianceRate,
        upcomingWorkouts,
        trends: {
          clients: clientTrend,
          workouts: workoutTrend,
          completedWorkouts: completedWorkoutTrend,
          complianceRate: complianceRateTrend,
          avgCompletionTime: avgCompletionTimeTrend,
        },
      });

      // Calculate top performing clients
      const clientWorkouts = {};
      workouts.forEach((workout) => {
        if (!clientWorkouts[workout.client_id]) {
          clientWorkouts[workout.client_id] = {
            total: 0,
            completed: 0,
          };
        }
        clientWorkouts[workout.client_id].total += 1;
        if (workout.status === "completed") {
          clientWorkouts[workout.client_id].completed += 1;
        }
      });

      const topPerformingClients = clients
        .map((client) => {
          const workoutStats = clientWorkouts[client.id] || {
            total: 0,
            completed: 0,
          };
          const complianceRate =
            workoutStats.total > 0
              ? Math.round((workoutStats.completed / workoutStats.total) * 100)
              : 0;
          return {
            id: client.id,
            name: client.name,
            email: client.email,
            complianceRate,
            workoutsCompleted: workoutStats.completed,
            status: client.status,
          };
        })
        .sort((a, b) => b.complianceRate - a.complianceRate)
        .slice(0, 5);

      setTopClients(topPerformingClients);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "There was a problem loading your dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading({
        clients: false,
        workouts: false,
        portals: false,
        metrics: false,
      });
    }
  };

  // Generate dynamic chart data from database results
  const [chartData, setChartData] = useState({
    clientActivity: [],
    complianceRate: [],
    clientProgress: [],
    workoutDistribution: [],
  });

  // Process data for charts
  useEffect(() => {
    if (loading.clients || loading.workouts || loading.metrics) return;

    // Process client activity data (workouts by month)
    const processClientActivityData = () => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentYear = new Date().getFullYear();
      const activityByMonth = {};

      // Initialize months
      monthNames.forEach((month, index) => {
        activityByMonth[month] = {
          date: month,
          workoutsAssigned: 0,
          workoutsCompleted: 0,
        };
      });

      // Count workouts by month
      workouts.forEach((workout) => {
        const workoutDate = new Date(workout.created_at);
        const workoutMonth = monthNames[workoutDate.getMonth()];

        // Only count workouts from current year
        if (workoutDate.getFullYear() === currentYear) {
          activityByMonth[workoutMonth].workoutsAssigned++;

          if (workout.status === "completed") {
            activityByMonth[workoutMonth].workoutsCompleted++;
          }
        }
      });

      // Convert to array and get last 7 months
      const currentMonthIndex = new Date().getMonth();
      const last7Months = [];

      for (let i = 6; i >= 0; i--) {
        const monthIndex = (currentMonthIndex - i + 12) % 12; // Handle wrapping around to previous year
        last7Months.push(activityByMonth[monthNames[monthIndex]]);
      }

      return last7Months.reverse(); // Most recent month last
    };

    // Process compliance rate data
    const processComplianceRateData = () => [
      {
        name: "Completed",
        value: dashboardData.complianceRate,
        color: "#4ade80",
      },
      {
        name: "Missed",
        value: 100 - dashboardData.complianceRate,
        color: "#f87171",
      },
    ];

    // Process client progress data from metrics
    const processClientProgressData = () => {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const progressByMonth = {};

      // Initialize with empty data for last 7 months
      const currentDate = new Date();
      const currentMonthIndex = currentDate.getMonth();

      for (let i = 6; i >= 0; i--) {
        const monthIndex = (currentMonthIndex - i + 12) % 12;
        const monthName = monthNames[monthIndex];

        progressByMonth[monthName] = {
          month: monthName,
          weight: 0,
          strength: 0,
          endurance: 0,
        };
      }

      // Process metrics data
      if (progressMetrics && progressMetrics.length > 0) {
        progressMetrics.forEach((metric) => {
          const metricDate = new Date(metric.date);
          const monthName = monthNames[metricDate.getMonth()];

          // Only include metrics from current year and if month exists in our data
          if (
            metricDate.getFullYear() === currentDate.getFullYear() &&
            progressByMonth[monthName]
          ) {
            // Update the appropriate metric type
            if (metric.metric_type === "weight" && progressByMonth[monthName]) {
              progressByMonth[monthName].weight = metric.value;
            } else if (
              metric.metric_type === "strength" &&
              progressByMonth[monthName]
            ) {
              progressByMonth[monthName].strength = metric.value;
            } else if (
              metric.metric_type === "endurance" &&
              progressByMonth[monthName]
            ) {
              progressByMonth[monthName].endurance = metric.value;
            }
          }
        });
      }

      // Convert to array and sort by month
      return Object.values(progressByMonth);
    };

    // Process workout distribution data
    const processWorkoutDistributionData = () => {
      // Get workouts from the last 4 weeks
      const now = new Date();
      const fourWeeksAgo = new Date(now);
      fourWeeksAgo.setDate(now.getDate() - 28);

      const recentWorkouts = workouts.filter((workout) => {
        const workoutDate = new Date(workout.created_at);
        return workoutDate >= fourWeeksAgo;
      });

      // Group workouts by week
      const weeklyData = [
        { name: "Week 1", strength: 0, cardio: 0, flexibility: 0 },
        { name: "Week 2", strength: 0, cardio: 0, flexibility: 0 },
        { name: "Week 3", strength: 0, cardio: 0, flexibility: 0 },
        { name: "Week 4", strength: 0, cardio: 0, flexibility: 0 },
      ];

      recentWorkouts.forEach((workout) => {
        const workoutDate = new Date(workout.created_at);
        const daysAgo = Math.floor(
          (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const weekIndex = Math.min(Math.floor(daysAgo / 7), 3); // 0-3 for weeks 1-4

        // Determine workout type based on exercises
        if (workout.exercises && workout.exercises.length > 0) {
          // Simple classification based on exercise names
          // In a real app, you'd have more sophisticated classification
          const exerciseNames = workout.exercises.map((ex) =>
            ex.name.toLowerCase(),
          );

          if (
            exerciseNames.some(
              (name) =>
                name.includes("bench") ||
                name.includes("squat") ||
                name.includes("deadlift") ||
                name.includes("press"),
            )
          ) {
            weeklyData[weekIndex].strength++;
          } else if (
            exerciseNames.some(
              (name) =>
                name.includes("run") ||
                name.includes("sprint") ||
                name.includes("jog") ||
                name.includes("cardio"),
            )
          ) {
            weeklyData[weekIndex].cardio++;
          } else if (
            exerciseNames.some(
              (name) =>
                name.includes("stretch") ||
                name.includes("yoga") ||
                name.includes("mobility"),
            )
          ) {
            weeklyData[weekIndex].flexibility++;
          } else {
            // Default to strength if we can't classify
            weeklyData[weekIndex].strength++;
          }
        }
      });

      return weeklyData;
    };

    // Update all chart data
    setChartData({
      clientActivity: processClientActivityData(),
      complianceRate: processComplianceRateData(),
      clientProgress: processClientProgressData(),
      workoutDistribution: processWorkoutDistributionData(),
    });
  }, [
    workouts,
    clients,
    progressMetrics,
    loading,
    dashboardData.complianceRate,
  ]);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your coaching business and client performance.
          </p>
        </div>

        {loading.clients || loading.workouts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[120px] bg-muted rounded-lg border border-border"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <AnalyticsCard
                title="Total Clients"
                value={dashboardData.totalClients}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                description={`${dashboardData.activeClients} active clients`}
                trend={
                  dashboardData.trends.clients !== null
                    ? {
                        value: dashboardData.trends.clients,
                        isPositive: dashboardData.trends.clients >= 0,
                      }
                    : undefined
                }
              />
              <AnalyticsCard
                title="Total Workouts"
                value={dashboardData.totalWorkouts}
                icon={<Dumbbell className="h-4 w-4 text-muted-foreground" />}
                description="Assigned to clients"
                trend={
                  dashboardData.trends.workouts !== null
                    ? {
                        value: dashboardData.trends.workouts,
                        isPositive: dashboardData.trends.workouts >= 0,
                      }
                    : undefined
                }
              />
              <AnalyticsCard
                title="Completed Workouts"
                value={dashboardData.completedWorkouts}
                icon={
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                }
                description="Successfully completed"
                trend={
                  dashboardData.trends.completedWorkouts !== null
                    ? {
                        value: dashboardData.trends.completedWorkouts,
                        isPositive: dashboardData.trends.completedWorkouts >= 0,
                      }
                    : undefined
                }
              />
              <AnalyticsCard
                title="Compliance Rate"
                value={`${dashboardData.complianceRate}%`}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                description="Overall completion rate"
                trend={
                  dashboardData.trends.complianceRate !== null
                    ? {
                        value: dashboardData.trends.complianceRate,
                        isPositive: dashboardData.trends.complianceRate >= 0,
                      }
                    : undefined
                }
              />
              <AnalyticsCard
                title="Upcoming Workouts"
                value={dashboardData.upcomingWorkouts}
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                description="Due in the next 7 days"
              />
              <AnalyticsCard
                title="Avg. Completion Time"
                value={`${dashboardData.avgCompletionTime || "0"} days`}
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                description="From assignment to completion"
                trend={
                  dashboardData.trends.avgCompletionTime !== null
                    ? {
                        value: dashboardData.trends.avgCompletionTime,
                        isPositive: dashboardData.trends.avgCompletionTime <= 0,
                      }
                    : undefined
                }
              />
            </div>

            {/* Client Activity Chart */}
            <ClientActivityChart data={chartData.clientActivity} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Compliance Rate Chart */}
              <ComplianceRateChart data={chartData.complianceRate} />

              {/* Client Progress Chart */}
              <ClientProgressChart data={chartData.clientProgress} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Workout Distribution Chart */}
              <WorkoutDistributionChart
                data={chartData.workoutDistribution}
                className="lg:col-span-2"
              />

              {/* Top Clients Table */}
              <TopClientsTable clients={topClients} className="lg:col-span-3" />
            </div>
          </>
        )}
      </div>
      <Toaster />
    </DashboardLayout>
  );
};

export default Dashboard;
