import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  const facultyFeatures = [
    {
      icon: BookOpen,
      title: "Collapsible Data Tables",
      description: "Manage large student datasets efficiently with collapsible sections, pagination (10-20 records per page), and clean navigation."
    },
    {
      icon: BarChart3,
      title: "Interactive Overview Analytics",
      description: "Real KPIs with bar charts for course performance, pie charts for grade distribution, and comprehensive dashboard summaries."
    },
    {
      icon: AlertCircle,
      title: "Grouped At-Risk Students",
      description: "See each at-risk student once with all problematic courses listed, searchable interface, and overall risk level indicators."
    },
    {
      icon: FileText,
      title: "Smart Search & Filters",
      description: "Instantly find any student or course with integrated search bars across all data tables and at-risk sections."
    }
  ];

  const studentFeatures = [
    {
      icon: TrendingUp,
      title: "Visual Performance Charts",
      description: "Interactive bar charts for mid-term marks, line graphs for overall metrics, and real-time predicted SGPA calculations."
    },
    {
      icon: Target,
      title: "Predicted Performance",
      description: "AI-powered predictions for end-term marks and final grades helping you plan and improve before it's too late."
    },
    {
      icon: Calendar,
      title: "Course-wise Breakdown",
      description: "See all your courses with attendance, assignments, quiz scores, and mid-term marks in collapsible, easy-to-read tables."
    },
    {
      icon: Star,
      title: "At-Risk Alerts",
      description: "Get notified about courses where you're at risk with actionable insights and recommendations for improvement."
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
                  Empower educators with intelligent data management—collapsible tables with pagination, 
                  grouped at-risk student views, interactive KPI dashboards with charts, and powerful search 
                  capabilities that make handling hundreds of students effortless.
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
                <Button variant="academic" size="lg" className="mt-8" onClick={() => navigate('/auth')}>
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
                  Stay on top of your academic journey with interactive performance charts, AI-powered 
                  predictions, collapsible course tables, and real-time insights that help you identify 
                  areas for improvement and achieve your goals.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">Interactive charts showing your performance trends</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">AI predictions for end-term marks and grades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">Collapsible course tables with detailed metrics</span>
                  </div>
                </div>
                <Button variant="accent" size="lg" className="mt-8" onClick={() => navigate('/auth')}>
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