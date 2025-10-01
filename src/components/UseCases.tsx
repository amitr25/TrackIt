import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Target, 
  AlertCircle,
  BarChart3,
  Calendar,
  FileText,
  Star
} from "lucide-react";

export const UseCases = () => {
  const facultyFeatures = [
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Upload and manage student data for multiple courses with batch processing capabilities."
    },
    {
      icon: BarChart3,
      title: "Class Analytics",
      description: "View comprehensive analytics for entire classes including performance distributions and trends."
    },
    {
      icon: AlertCircle,
      title: "At-Risk Students",
      description: "Identify students who need intervention with AI-powered early warning systems."
    },
    {
      icon: FileText,
      title: "Progress Reports",
      description: "Generate detailed reports for administration, parents, and academic committees."
    }
  ];

  const studentFeatures = [
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor your academic progress with detailed analytics and visual representations."
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set academic goals and track progress with personalized recommendations and milestones."
    },
    {
      icon: Calendar,
      title: "Attendance Insights",
      description: "View attendance patterns and understand their correlation with academic performance."
    },
    {
      icon: Star,
      title: "Achievement Badges",
      description: "Earn recognition for academic milestones and consistent performance improvements."
    }
  ];

  return (
    <section id="faculty" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built for{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Every User
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            TrackIt provides tailored experiences for faculty and students, ensuring everyone 
            gets the most relevant insights and tools for their academic journey.
          </p>
        </div>

        <Tabs defaultValue="faculty" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="faculty" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              For Faculty
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              For Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faculty" className="space-y-12">
            {/* Faculty Hero Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Faculty Dashboard</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Empower educators with comprehensive tools to track, analyze, and improve 
                  student outcomes. Upload data seamlessly and gain actionable insights that 
                  drive better teaching decisions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-foreground">Batch upload student data across multiple courses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-foreground">Real-time analytics and performance insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-foreground">Early intervention recommendations</span>
                  </div>
                </div>
                <Button variant="academic" size="lg" className="mt-8">
                  Access Faculty Portal
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {facultyFeatures.map((feature, index) => (
                  <Card 
                    key={feature.title} 
                    className="p-6 bg-gradient-card border-border/50 hover:shadow-medium transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-12">
            {/* Student Hero Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">Student Dashboard</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Take control of your academic journey with personalized insights, 
                  performance tracking, and AI-powered recommendations that help you 
                  achieve your educational goals.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">Personalized performance analytics and trends</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">Predictive insights for academic success</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">Goal setting and progress tracking</span>
                  </div>
                </div>
                <Button variant="accent" size="lg" className="mt-8">
                  Access Student Portal
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {studentFeatures.map((feature, index) => (
                  <Card 
                    key={feature.title} 
                    className="p-6 bg-gradient-card border-border/50 hover:shadow-medium transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-10 h-10 bg-secondary-light rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};