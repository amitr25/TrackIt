import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Brain, 
  Target, 
  BarChart3,
  Clock,
  AlertTriangle 
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Progress Tracking Dashboard",
      description: "Real-time visualization of student performance with interactive charts and analytics that help identify trends and patterns.",
      color: "bg-primary-light text-primary"
    },
    {
      icon: AlertTriangle,
      title: "Early Risk Identification",
      description: "AI-powered algorithms analyze patterns to predict students at risk of falling behind, enabling proactive intervention.",
      color: "bg-accent-light text-accent"
    },
    {
      icon: Target,
      title: "Personalized Learning Plans",
      description: "Custom-tailored academic recommendations based on individual performance data and learning patterns.",
      color: "bg-secondary-light text-secondary"
    },
    {
      icon: BarChart3,
      title: "Attendance & Performance Analytics",
      description: "Comprehensive tracking of attendance patterns correlated with academic performance and engagement metrics.",
      color: "bg-primary-light text-primary"
    },
    {
      icon: Shield,
      title: "Microsoft Azure Authentication",
      description: "Secure login with institutional Outlook/College ID integration and role-based access control (RBAC).",
      color: "bg-analytics-blue/10 text-analytics-blue"
    },
    {
      icon: Brain,
      title: "ML-Powered Insights",
      description: "Machine learning models provide predictive analytics and intelligent recommendations for academic success.",
      color: "bg-secondary-light text-secondary"
    },
    {
      icon: Users,
      title: "Role-Based Dashboards",
      description: "Customized interfaces for faculty and students with appropriate access levels and relevant information.",
      color: "bg-accent-light text-accent"
    },
    {
      icon: Clock,
      title: "Real-Time Data Processing",
      description: "Instant updates and processing of academic data ensuring current and accurate insights at all times.",
      color: "bg-primary-light text-primary"
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            TrackIt combines cutting-edge technology with educational insights to deliver 
            a comprehensive platform that transforms how institutions manage and analyze student data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="hover:shadow-medium transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};