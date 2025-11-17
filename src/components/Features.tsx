import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Brain, 
  Target, 
  BarChart3,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Minimize2,
  PieChart
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: PieChart,
      title: "Interactive Overview Dashboards",
      description: "Dynamic dashboards with real KPIs, interactive charts showing course performance, grade distribution, and comprehensive analytics at a glance.",
      color: "bg-primary-light text-primary"
    },
    {
      icon: AlertTriangle,
      title: "Smart At-Risk Detection",
      description: "AI-powered system groups at-risk students intelligently, showing all problematic courses per student with searchable interface and overall risk levels.",
      color: "bg-accent-light text-accent"
    },
    {
      icon: Minimize2,
      title: "Collapsible Data Sections",
      description: "Efficiently manage large datasets with collapsible tables and sections, keeping your interface clean and focused on what matters.",
      color: "bg-secondary-light text-secondary"
    },
    {
      icon: Filter,
      title: "Advanced Pagination & Filtering",
      description: "Handle thousands of records effortlessly with smart pagination (10-20 records per page) and real-time search capabilities.",
      color: "bg-primary-light text-primary"
    },
    {
      icon: Search,
      title: "Powerful Search Features",
      description: "Find any student, course, or record instantly with integrated search bars across all data tables and at-risk sections.",
      color: "bg-analytics-blue/10 text-analytics-blue"
    },
    {
      icon: BarChart3,
      title: "Visual Analytics & Charts",
      description: "Beautiful bar charts, pie charts, and line graphs display course performance, grade distribution, and performance metrics interactively.",
      color: "bg-secondary-light text-secondary"
    },
    {
      icon: Shield,
      title: "Azure Authentication",
      description: "Secure login with institutional Outlook/College ID integration and role-based access control (RBAC) for faculty and students.",
      color: "bg-accent-light text-accent"
    },
    {
      icon: Brain,
      title: "ML-Powered Predictions",
      description: "Machine learning models predict end-term marks, identify patterns, and provide intelligent recommendations for academic success.",
      color: "bg-primary-light text-primary"
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Latest Features for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            TrackIt now includes advanced data management, intelligent grouping, interactive visualizations, 
            and powerful search capabilities—everything you need to transform academic data into actionable insights.
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