import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Clock,
  Users,
  Dumbbell,
  BarChart,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

interface Tutorial {
  id: number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

export default function Tutorials() {
  // Sample tutorials data
  const tutorials: Tutorial[] = [
    {
      id: 1,
      title: "Getting Started with PulseCoach",
      description:
        "Learn the basics of setting up your account and navigating the platform.",
      duration: "5:30",
      thumbnail:
        "https://images.unsplash.com/photo-1593697972672-b1c1902219e4?w=800&q=80",
      category: "basics",
      level: "Beginner",
    },
    {
      id: 2,
      title: "Creating Your Coach Profile",
      description:
        "Set up your professional profile to showcase your expertise to clients.",
      duration: "4:15",
      thumbnail:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      category: "basics",
      level: "Beginner",
    },
    {
      id: 3,
      title: "Adding and Managing Clients",
      description:
        "Learn how to add new clients and organize them effectively.",
      duration: "7:45",
      thumbnail:
        "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80",
      category: "clients",
      level: "Beginner",
    },
    {
      id: 4,
      title: "Creating Your First Workout Plan",
      description:
        "Master the workout builder to create effective training programs.",
      duration: "10:20",
      thumbnail:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      category: "workouts",
      level: "Beginner",
    },
    {
      id: 5,
      title: "Advanced Workout Programming",
      description:
        "Learn advanced techniques for periodization and progressive overload.",
      duration: "12:45",
      thumbnail:
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80",
      category: "workouts",
      level: "Advanced",
    },
    {
      id: 6,
      title: "Setting Up Client Portals",
      description:
        "Generate and customize client portals for a professional experience.",
      duration: "6:30",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      category: "clients",
      level: "Intermediate",
    },
    {
      id: 7,
      title: "Tracking Client Progress",
      description:
        "Use the analytics tools to monitor and visualize client progress.",
      duration: "8:15",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      category: "progress",
      level: "Intermediate",
    },
    {
      id: 8,
      title: "Effective Client Communication",
      description:
        "Master the messaging system to maintain strong client relationships.",
      duration: "5:50",
      thumbnail:
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
      category: "clients",
      level: "Intermediate",
    },
    {
      id: 9,
      title: "Creating Exercise Templates",
      description:
        "Save time by creating reusable exercise templates for your workouts.",
      duration: "7:10",
      thumbnail:
        "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80",
      category: "workouts",
      level: "Intermediate",
    },
    {
      id: 10,
      title: "Advanced Analytics Dashboard",
      description:
        "Get the most out of your analytics dashboard to optimize your coaching.",
      duration: "9:30",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      category: "progress",
      level: "Advanced",
    },
    {
      id: 11,
      title: "Customizing Notification Settings",
      description:
        "Configure your notification preferences for optimal workflow.",
      duration: "4:45",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      category: "basics",
      level: "Beginner",
    },
    {
      id: 12,
      title: "Integrating with Third-Party Apps",
      description:
        "Connect PulseCoach with other tools to enhance your coaching business.",
      duration: "11:20",
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      category: "advanced",
      level: "Advanced",
    },
  ];

  // Filter tutorials by category
  const basicsTutorials = tutorials.filter(
    (tutorial) => tutorial.category === "basics",
  );
  const clientsTutorials = tutorials.filter(
    (tutorial) => tutorial.category === "clients",
  );
  const workoutsTutorials = tutorials.filter(
    (tutorial) => tutorial.category === "workouts",
  );
  const progressTutorials = tutorials.filter(
    (tutorial) => tutorial.category === "progress",
  );
  const advancedTutorials = tutorials.filter(
    (tutorial) => tutorial.category === "advanced",
  );

  // Render tutorial card
  const renderTutorialCard = (tutorial: Tutorial) => (
    <Card
      key={tutorial.id}
      className="border-border bg-card shadow-md hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="relative">
        <img
          src={tutorial.thumbnail}
          alt={tutorial.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <Play className="h-8 w-8 text-white" fill="white" />
          </Button>
        </div>
        <Badge className="absolute top-3 right-3 bg-blue-600 text-white border-none">
          {tutorial.level}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-foreground">
          {tutorial.title}
        </CardTitle>
        <CardDescription className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" /> {tutorial.duration}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{tutorial.description}</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
        >
          Watch Tutorial
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background pt-24">
      <div className="container px-4 mx-auto py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
            Video Tutorials
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            Learn to Master PulseCoach
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our collection of video tutorials to help you get the most
            out of the platform.
          </p>
        </div>

        {/* Featured Tutorials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {basicsTutorials.slice(0, 3).map(renderTutorialCard)}
          </div>
        </div>

        {/* All Tutorials */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            All Tutorials
          </h2>

          <Tabs defaultValue="all" className="mb-16">
            <TabsList className="mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="clients">Client Management</TabsTrigger>
              <TabsTrigger value="workouts">Workout Builder</TabsTrigger>
              <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map(renderTutorialCard)}
              </div>
            </TabsContent>

            <TabsContent value="basics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {basicsTutorials.map(renderTutorialCard)}
              </div>
            </TabsContent>

            <TabsContent value="clients">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientsTutorials.map(renderTutorialCard)}
              </div>
            </TabsContent>

            <TabsContent value="workouts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutsTutorials.map(renderTutorialCard)}
              </div>
            </TabsContent>

            <TabsContent value="progress">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {progressTutorials.map(renderTutorialCard)}
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {advancedTutorials.map(renderTutorialCard)}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="my-16" />

        {/* Learning Paths */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Learning Paths
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these curated tutorial sequences to master specific aspects
              of PulseCoach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-foreground">
                  Client Management Mastery
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  5 tutorials • 35 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Learn everything about adding clients, creating portals, and
                  managing client relationships effectively.
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Start Learning Path
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-foreground">
                  Workout Programming Pro
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  4 tutorials • 40 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Master the workout builder from basics to advanced programming
                  techniques and templates.
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Start Learning Path
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-foreground">
                  Analytics & Reporting
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  3 tutorials • 25 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Learn how to track progress, analyze data, and generate
                  insightful reports for your clients.
                </p>
                <Button
                  variant="outline"
                  className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Start Learning Path
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-100 to-background rounded-3xl p-8 md:p-12 shadow-xl border border-border dark:from-blue-900/20 dark:to-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Our support team is ready to help you with any questions or
              challenges you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto">
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 w-full sm:w-auto"
              >
                Request a Tutorial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
