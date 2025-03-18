import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Users,
  Dumbbell,
  BarChart,
  MessageSquare,
  FileText,
  ChevronRight,
  Mail,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

interface GuideItem {
  title: string;
  description: string;
  icon: JSX.Element;
  link: string;
}

export default function HelpCenter() {
  // Sample FAQ data
  const generalFaqs: FaqItem[] = [
    {
      question: "What is PulseCoach?",
      answer:
        "PulseCoach is a comprehensive platform for fitness coaches to manage clients, create personalized workout plans, and provide a seamless client experience. Our platform combines powerful coaching tools with an exceptional client portal system.",
    },
    {
      question: "How do I get started with PulseCoach?",
      answer:
        "Getting started is easy! Simply sign up for an account, complete your coach profile, and start adding clients. You can then create workout plans, track progress, and generate client portals. We recommend watching our onboarding tutorial videos for a complete walkthrough.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a 14-day free trial with full access to all features. No credit card is required to start your trial. After the trial period, you can choose from our different subscription plans based on your needs.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Absolutely! You can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access until the end of your current billing period.",
    },
    {
      question: "How secure is my data on PulseCoach?",
      answer:
        "We take data security very seriously. PulseCoach uses industry-standard encryption and security practices to protect your data and your clients' information. All data is stored securely and we regularly perform security audits.",
    },
  ];

  const clientFaqs: FaqItem[] = [
    {
      question: "How do I add a new client to my account?",
      answer:
        "To add a new client, go to the Clients section in your dashboard and click the 'Add Client' button. Fill in the client's details and save. You can then assign workouts and generate a client portal for them.",
    },
    {
      question: "How do clients access their workout plans?",
      answer:
        "Clients access their workout plans through a unique client portal link that you generate for them. This link can be password-protected for added security. You can send this link directly to your clients via email from within the platform.",
    },
    {
      question: "Can clients provide feedback on their workouts?",
      answer:
        "Yes, clients can provide feedback on each workout through their client portal. They can rate the difficulty, add comments, and mark exercises as completed. You'll receive notifications when clients provide feedback.",
    },
    {
      question: "How do I track client progress?",
      answer:
        "You can track client progress through the Progress Tracking section in each client's profile. Here you can record measurements, performance metrics, and view compliance rates. Visual charts help you and your clients visualize progress over time.",
    },
    {
      question: "Can I communicate with clients through the platform?",
      answer:
        "Yes, PulseCoach includes a messaging system that allows you to communicate directly with your clients. You can send individual messages or notifications to all clients. Clients can respond through their portal.",
    },
  ];

  const workoutFaqs: FaqItem[] = [
    {
      question: "How do I create a workout plan?",
      answer:
        "To create a workout plan, go to the Workout Builder section and click 'New Workout'. You can then use our drag-and-drop interface to add exercises, set reps and sets, add instructions, and organize your workout into sections.",
    },
    {
      question: "Can I save workout templates?",
      answer:
        "Yes, you can save any workout as a template for future use. When creating or editing a workout, click 'Save as Template'. Your templates will be available when creating new workouts, saving you time when programming for multiple clients.",
    },
    {
      question: "How do I assign workouts to clients?",
      answer:
        "After creating a workout, you can assign it to one or multiple clients. Select the workout, click 'Assign', choose the clients, set the schedule (days/dates), and confirm. Clients will see the assigned workouts in their portal.",
    },
    {
      question: "Can I include videos or images with exercises?",
      answer:
        "Absolutely! You can add demonstration videos and images to any exercise in your workouts. This helps clients understand proper form and technique. You can upload your own videos/images or use our built-in exercise library.",
    },
    {
      question: "How do I track workout compliance?",
      answer:
        "Workout compliance is tracked automatically based on client check-ins. When clients mark workouts as completed in their portal, this data is used to calculate compliance rates. You can view compliance metrics in the client's profile and in your dashboard analytics.",
    },
  ];

  // Sample guides data
  const guides: GuideItem[] = [
    {
      title: "Getting Started Guide",
      description:
        "Everything you need to know to set up your account and start using PulseCoach effectively.",
      icon: <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      link: "#",
    },
    {
      title: "Client Management",
      description:
        "Learn how to add, organize, and manage your fitness clients efficiently.",
      icon: <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      link: "#",
    },
    {
      title: "Workout Builder Tutorial",
      description:
        "Master our drag-and-drop workout builder to create effective training programs.",
      icon: <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      link: "#",
    },
    {
      title: "Progress Tracking",
      description:
        "Understand how to track and visualize client progress with our analytics tools.",
      icon: <BarChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      link: "#",
    },
    {
      title: "Client Portal Setup",
      description:
        "Set up professional client portals and customize the client experience.",
      icon: <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      link: "#",
    },
    {
      title: "Messaging System",
      description:
        "Learn how to communicate effectively with clients through our platform.",
      icon: (
        <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      ),
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background pt-24">
      <div className="container px-4 mx-auto py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
            Help Center
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">
            How can we help you today?
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Find answers to common questions, browse our guides, or contact our
            support team.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className="pl-10 py-6 text-lg rounded-full border-border"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-border bg-card shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <FileText className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground mb-4">
                Browse our detailed documentation for in-depth information about
                all features.
              </CardDescription>
              <Button
                variant="outline"
                className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                View Documentation
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Live Chat Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground mb-4">
                Chat with our support team for immediate assistance with any
                issues.
              </CardDescription>
              <Button
                variant="outline"
                className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                Start Chat
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-foreground">
                <Mail className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </CardDescription>
              <Button
                variant="outline"
                className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact Us
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Guides Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Helpful Guides
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of guides to help you get the most out of
              PulseCoach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <Card
                key={index}
                className="border-border bg-card shadow-md hover:shadow-lg transition-all"
              >
                <CardContent className="pt-6">
                  <div className="mb-4">{guide.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {guide.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {guide.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full justify-between border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Read Guide
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to common questions about PulseCoach.
            </p>
          </div>

          <Tabs defaultValue="general" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="clients">Client Management</TabsTrigger>
              <TabsTrigger value="workouts">Workout Builder</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Accordion type="single" collapsible className="w-full">
                {generalFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-foreground font-medium text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="clients">
              <Accordion type="single" collapsible className="w-full">
                {clientFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-foreground font-medium text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="workouts">
              <Accordion type="single" collapsible className="w-full">
                {workoutFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-foreground font-medium text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-6">
              Still have questions? We're here to help.
            </p>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
              Contact Support
            </Button>
          </div>
        </div>

        <Separator className="my-16" />

        {/* Additional Resources */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Additional Resources
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
            >
              Video Tutorials
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
            >
              Webinars
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
            >
              API Documentation
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:text-blue-600 dark:hover:text-blue-400"
            >
              Release Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
