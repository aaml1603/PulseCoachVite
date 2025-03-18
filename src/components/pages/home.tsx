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
  Settings,
  User,
  Dumbbell,
  Shield,
  LineChart,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronRight,
  Users,
  Loader2,
  Twitter,
  Instagram,
  X,
  Calendar,
  BarChart,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Define the Plan type
interface Plan {
  id: string;
  object: string;
  active: boolean;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  product: string;
  created: number;
  livemode: boolean;
  [key: string]: any;
}

// Testimonial interface
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
}

// Feature interface
interface Feature {
  title: string;
  description: string;
  icon: JSX.Element;
}

export default function LandingPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Use the Supabase client to call the Edge Function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-plans",
      );

      if (error) {
        throw error;
      }

      setPlans(data || []);
      setError("");
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      setError("Failed to load plans. Please try again later.");
    }
  };

  // Handle checkout process
  const handleCheckout = async (priceId: string) => {
    if (!user) {
      // Redirect to login if user is not authenticated
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "default",
      });
      window.location.href = "/login?redirect=pricing";
      return;
    }

    setIsLoading(true);
    setProcessingPlanId(priceId);
    setError("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            price_id: priceId,
            user_id: user.id,
            return_url: `${window.location.origin}/dashboard`,
          },
          headers: {
            "X-Customer-Email": user.email || "",
          },
        },
      );

      if (error) {
        throw error;
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        toast({
          title: "Redirecting to checkout",
          description:
            "You'll be redirected to Stripe to complete your purchase.",
          variant: "default",
        });
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError("Failed to create checkout session. Please try again.");
      toast({
        title: "Checkout failed",
        description:
          "There was an error creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    });

    return formatter.format(amount / 100);
  };

  // Sample features data
  const features: Feature[] = [
    {
      title: "Client Management",
      description:
        "Easily manage your fitness clients with detailed profiles, progress tracking, and communication tools.",
      icon: <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: "Workout Builder",
      description:
        "Create personalized workout plans with our intuitive drag-and-drop builder and save templates for future use.",
      icon: <Dumbbell className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: "Progress Tracking",
      description:
        "Track client measurements, performance metrics, and compliance with visual charts and analytics.",
      icon: (
        <LineChart className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      ),
    },
    {
      title: "Client Portal",
      description:
        "Generate unique, password-protected links for clients to access their personalized workout plans.",
      icon: <LinkIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
    },
  ];

  // Sample testimonials data
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Personal Trainer",
      company: "FitLife Gym",
      content:
        "This platform has transformed how I manage my clients. The workout builder saves me hours each week, and my clients love the personalized portal experience.",
      avatar: "sarah",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Fitness Coach",
      company: "Elite Athletics",
      content:
        "I've tried many fitness coaching platforms, but this one stands out with its intuitive interface and comprehensive tracking features. My client retention has improved significantly.",
      avatar: "michael",
    },
    {
      id: 3,
      name: "Aisha Patel",
      role: "Nutrition Coach",
      company: "Wellness Studio",
      content:
        "The ability to create custom client portals has been a game-changer for my business. My clients appreciate the professional experience and I can focus more on coaching.",
      avatar: "aisha",
    },
  ];

  // Plan features
  const getPlanFeatures = (planType: string) => {
    const basicFeatures = [
      "Up to 5 active clients",
      "Basic workout templates",
      "Client portal access",
      "Email support",
    ];

    const proFeatures = [
      ...basicFeatures,
      "Up to 25 active clients",
      "Advanced progress tracking",
      "Custom branding",
      "Priority support",
    ];

    const enterpriseFeatures = [
      "Unlimited clients",
      "White-label solution",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 premium support",
    ];

    if (planType.includes("PRO")) return proFeatures;
    if (planType.includes("ENTERPRISE")) return enterpriseFeatures;
    return basicFeatures;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="font-bold text-xl flex items-center text-blue-600 dark:text-blue-400"
            >
              <Dumbbell className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
              FitCoach Pro
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Dashboard
                  </Button>
                </Link>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          alt={user.email || ""}
                        />
                        <AvatarFallback>
                          {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline-block">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-background border-border"
                  >
                    <DropdownMenuLabel className="text-foreground">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-muted" />
                    <DropdownMenuItem className="text-foreground hover:text-blue-600 focus:text-blue-600 dark:hover:text-blue-400 dark:focus:text-blue-400">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground hover:text-blue-600 focus:text-blue-600 dark:hover:text-blue-400 dark:focus:text-blue-400">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-muted" />
                    <DropdownMenuItem
                      onSelect={() => signOut()}
                      className="text-foreground hover:text-blue-600 focus:text-blue-600 dark:hover:text-blue-400 dark:focus:text-blue-400"
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Sign In
                  </Button>
                </Link>
                <ThemeToggle />
                <Link to="/signup">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2 space-y-8">
                <div>
                  <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                    Fitness Coaching Platform
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                    Elevate Your Coaching Business
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-muted-foreground">
                  A comprehensive platform for fitness coaches to manage
                  clients, create personalized workout plans, and provide a
                  seamless client experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto"
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 w-full sm:w-auto"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Book a Demo
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>No credit card required</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-2 bg-muted"
                  />
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>14-day free trial</span>
                  <Separator
                    orientation="vertical"
                    className="h-4 mx-2 bg-muted"
                  />
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-blue-200/60 via-blue-400/40 to-blue-600/10 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-900/10 rounded-3xl blur-2xl transform scale-110" />
                <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl shadow-xl overflow-hidden dark:bg-background/80">
                  <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-xl">
                    <div className="flex items-center gap-2 px-3 py-1">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="ml-2 text-xs text-white font-medium">
                        Client Dashboard
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <img
                      src="https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&q=80"
                      alt="Fitness dashboard"
                      className="rounded-lg shadow-md border border-border w-full"
                    />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          Clients
                        </h4>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                          24
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-100 dark:border-green-800">
                        <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">
                          Compliance
                        </h4>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                          87%
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                        <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Workouts
                        </h4>
                        <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          156
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-200/60 dark:bg-blue-900/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 -z-10 h-[300px] w-[300px] rounded-full bg-blue-400/40 dark:bg-blue-800/20 blur-[100px]" />
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                Features
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Everything You Need to Grow Your Coaching Business
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Our platform provides all the tools you need to manage clients,
                create workout plans, track progress, and deliver a professional
                experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-border bg-card shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle className="text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                    Workout Builder
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    Create Custom Workout Plans in Minutes
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Our intuitive drag-and-drop workout builder makes it easy to
                    create personalized training plans for your clients.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Drag-and-drop exercise library with 1000+ exercises
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Customize sets, reps, rest periods, and instructions
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Save templates for quick assignment to multiple clients
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Add video demonstrations and written instructions
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-blue-200/60 via-blue-400/40 to-blue-600/10 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-900/10 rounded-3xl blur-xl transform scale-110" />
                  <img
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"
                    alt="Workout Builder Interface"
                    className="rounded-xl shadow-xl border border-border w-full relative z-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-24">
                <div className="order-2 lg:order-1 relative">
                  <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-blue-200/60 via-blue-400/40 to-blue-600/10 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-900/10 rounded-3xl blur-xl transform scale-110" />
                  <img
                    src="https://images.unsplash.com/photo-1581244277943-fe4a9c777540?w=800&q=80"
                    alt="Client Portal"
                    className="rounded-xl shadow-xl border border-border w-full relative z-10"
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                    Client Portal
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    Provide a Seamless Client Experience
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Generate unique, password-protected portals for your clients
                    to access their personalized workout plans without
                    registration.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        One-click portal generation with custom access links
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Clients can view workouts, track progress, and provide
                        feedback
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Mobile-friendly interface for on-the-go access
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Optional branding customization for a professional look
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-24">
                <div>
                  <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                    Progress Tracking
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    Track Client Progress with Visual Analytics
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Monitor client performance, measurements, and compliance
                    with comprehensive tracking tools and visual charts.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Track body measurements, weight, and performance metrics
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Visual charts and graphs to visualize progress over time
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Progress photo comparison with before/after views
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">
                        Automated compliance tracking and reporting
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="relative">
                  <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-blue-200/60 via-blue-400/40 to-blue-600/10 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-900/10 rounded-3xl blur-xl transform scale-110" />
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                    alt="Progress Tracking"
                    className="rounded-xl shadow-xl border border-border w-full relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 md:py-24 bg-background dark:bg-background">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                Choose the perfect plan for your coaching business. All plans
                include access to our core features. No hidden fees or
                surprises.
              </p>
            </div>

            {error && (
              <div
                className="bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded relative mb-6"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
                <button
                  className="absolute top-0 bottom-0 right-0 px-4 py-3"
                  onClick={() => setError("")}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="flex flex-col h-full border-border bg-card shadow-lg hover:shadow-xl transition-all"
                >
                  <CardHeader className="pb-4">
                    <CardDescription className="text-sm text-muted-foreground">
                      {plan.interval_count === 1
                        ? "Monthly"
                        : `Every ${plan.interval_count} ${plan.interval}s`}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">
                        {formatCurrency(plan.amount, plan.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <Separator className="my-4 bg-muted" />
                    <ul className="space-y-3">
                      {getPlanFeatures(plan.product).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start text-foreground"
                        >
                          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading && processingPlanId === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Subscribe Now
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                Loved by Fitness Professionals
              </h2>
              <p className="text-muted-foreground max-w-[700px] mx-auto">
                See what coaches and trainers have to say about our platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="border-border bg-card shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.avatar}`}
                          alt={testimonial.name}
                        />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base text-foreground">
                          {testimonial.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      {testimonial.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 mx-auto">
            <div className="bg-gradient-to-r from-blue-100 to-background rounded-3xl p-8 md:p-12 shadow-xl border border-border dark:from-blue-900/20 dark:to-background">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Ready to Transform Your Coaching Business?
                </h2>
                <p className="text-lg md:text-xl mb-8 text-muted-foreground">
                  Join hundreds of fitness professionals who are already growing
                  their business and delivering exceptional client experiences.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto"
                    >
                      Start Your Free Trial
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 w-full sm:w-auto"
                  >
                    Schedule a Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 dark:bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link
                to="/"
                className="font-bold text-xl flex items-center mb-4 text-blue-600 dark:text-blue-400"
              >
                <Dumbbell className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                FitCoach Pro
              </Link>
              <p className="text-muted-foreground mb-4">
                A comprehensive platform for fitness coaches to manage clients,
                create workout plans, and deliver exceptional experiences.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Users className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-foreground">
                Platform
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-foreground">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/help-center"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tutorials"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Tutorials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-foreground">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-muted" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FitCoach Pro. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                Privacy
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                Terms
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
