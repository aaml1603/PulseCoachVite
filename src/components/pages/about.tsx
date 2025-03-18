import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell,
  Users,
  LineChart,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export default function AboutPage() {
  // Sample team members data
  const teamMembers: TeamMember[] = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      bio: "Former Olympic athlete with 15+ years of coaching experience. Sarah founded PulseCoach to help fitness professionals scale their impact.",
      avatar: "sarah",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Tech industry veteran with a passion for fitness. Michael leads our engineering team to build intuitive tools for coaches.",
      avatar: "michael",
    },
    {
      name: "Aisha Patel",
      role: "Head of Coach Success",
      bio: "Certified fitness coach and business consultant. Aisha helps coaches optimize their workflows and grow their businesses.",
      avatar: "aisha",
    },
    {
      name: "David Rodriguez",
      role: "Lead Designer",
      bio: "UX/UI specialist with a background in health tech. David ensures our platform is beautiful and intuitive to use.",
      avatar: "david",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background pt-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
              <div>
                <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
                  About PulseCoach
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Empowering Fitness Professionals Worldwide
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Founded in 2022, PulseCoach is on a mission to transform how
                fitness professionals manage their businesses and connect with
                clients. Our platform combines powerful coaching tools with an
                exceptional client experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full sm:w-auto"
                  >
                    Join Our Community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -z-10 inset-0 bg-gradient-to-tr from-blue-200/60 via-blue-400/40 to-blue-600/10 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-900/10 rounded-3xl blur-2xl transform scale-110" />
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80"
                alt="PulseCoach team"
                className="rounded-xl shadow-xl border border-border w-full relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
              Our Story
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-foreground">
              From Fitness Professionals, For Fitness Professionals
            </h2>
            <p className="text-muted-foreground">
              PulseCoach was born from the frustration of fitness professionals
              trying to juggle client management, workout programming, and
              business growth with inadequate tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-border bg-card shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  The Challenge
                </h3>
                <p className="text-muted-foreground">
                  Our founder, Sarah, struggled to scale her coaching business
                  while maintaining quality. Existing tools were either too
                  complex or too limited.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  The Solution
                </h3>
                <p className="text-muted-foreground">
                  We assembled a team of fitness professionals and tech experts
                  to build a platform that truly understands the needs of modern
                  coaches.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  The Impact
                </h3>
                <p className="text-muted-foreground">
                  Today, thousands of fitness professionals use PulseCoach to
                  manage their businesses more efficiently and deliver
                  exceptional client experiences.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                  alt="Founder"
                  className="rounded-xl shadow-md w-full"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  A Message from Our Founder
                </h3>
                <p className="text-muted-foreground mb-6">
                  "As a fitness coach, I was spending more time on admin tasks
                  than actually coaching. I knew there had to be a better way.
                  PulseCoach was built to solve the real challenges coaches face
                  every day. Our mission is to give fitness professionals the
                  tools they need to focus on what they do best: transforming
                  lives through fitness."
                </p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=sarah`}
                      alt="Sarah Johnson"
                    />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      Sarah Johnson
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Founder & CEO
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
              Our Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Meet the People Behind PulseCoach
            </h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              Our diverse team combines expertise in fitness, technology, and
              business to create the ultimate coaching platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-border bg-card shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`}
                        alt={member.name}
                      />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 mb-4">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground">{member.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30 dark:bg-muted/10">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 border-none">
              Our Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
              What Drives Us Every Day
            </h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              These core principles guide everything we do at PulseCoach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Coach-Centered Design
                </h3>
                <p className="text-muted-foreground">
                  We build every feature with the real needs of fitness
                  professionals in mind, constantly gathering feedback from our
                  community.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Client Experience Excellence
                </h3>
                <p className="text-muted-foreground">
                  We believe that a seamless client experience is crucial for
                  coaching success, so we prioritize intuitive interfaces and
                  clear communication.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Continuous Innovation
                </h3>
                <p className="text-muted-foreground">
                  The fitness industry evolves rapidly, and so do we. We're
                  committed to staying ahead with cutting-edge features and
                  improvements.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Empowering Growth
                </h3>
                <p className="text-muted-foreground">
                  We measure our success by how well we help fitness
                  professionals scale their businesses and impact more lives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="bg-gradient-to-r from-blue-100 to-background rounded-3xl p-8 md:p-12 shadow-xl border border-border dark:from-blue-900/20 dark:to-background">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Join the PulseCoach Community
              </h2>
              <p className="text-lg md:text-xl mb-8 text-muted-foreground">
                Experience how PulseCoach can transform your coaching business
                and help you deliver exceptional client experiences.
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
    </div>
  );
}
