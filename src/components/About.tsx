import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PuzzleIcon, 
  Target, 
  Lightbulb, 
  Shield,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export const About = () => {
  const problems = [
    "Student data scattered across multiple systems and formats",
    "Lack of actionable insights from academic performance data", 
    "Delayed identification of at-risk students",
    "Manual, time-consuming analysis processes",
    "Inconsistent data collection and reporting standards"
  ];

  const solutions = [
    "Unified platform for all student academic data",
    "AI-powered analytics generating actionable insights",
    "Early risk identification with predictive modeling",
    "Automated analysis and real-time dashboard updates",
    "Standardized data formats and collection processes"
  ];

  const benefits = [
    {
      icon: Target,
      title: "Improved Student Outcomes",
      description: "Early intervention and personalized learning plans lead to better academic performance and reduced dropout rates."
    },
    {
      icon: Lightbulb,
      title: "Data-Driven Decisions",
      description: "Faculty and administrators make informed decisions based on comprehensive analytics and predictive insights."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with Microsoft Azure integration ensures data protection and institutional compliance."
    }
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              TrackIt
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding the challenge and delivering the solution that transforms 
            academic data management for higher education institutions.
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Problem */}
          <Card className="p-8 bg-gradient-card border-border/50">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <PuzzleIcon className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl text-foreground">The Problem</CardTitle>
              </div>
              <CardDescription className="text-lg text-muted-foreground">
                Educational institutions struggle with fragmented student data that fails to provide meaningful insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{problem}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Solution */}
          <Card className="p-8 bg-gradient-card border-border/50">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl text-foreground">Our Solution</CardTitle>
              </div>
              <CardDescription className="text-lg text-muted-foreground">
                TrackIt provides a comprehensive platform that unifies, analyzes, and transforms academic data into actionable insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground">{solution}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Choose TrackIt?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={benefit.title} 
                className="text-center p-8 bg-gradient-card border-border/50 hover:shadow-medium transition-all duration-300"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="pt-0">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-4">{benefit.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <Card className="p-12 bg-gradient-hero text-center">
          <CardContent className="pt-0">
            <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
            <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              To empower educational institutions with intelligent data analytics that transform 
              scattered academic information into meaningful insights, enabling proactive support 
              for student success and institutional excellence.
            </p>
            <Button variant="secondary" size="lg" className="group">
              Start Your Journey with TrackIt
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};