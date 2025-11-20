import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Cpu, Eye, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import workflowImage from "@/assets/workflow-diagram.jpg";

export const Workflow = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      icon: Upload,
      title: "Faculty Upload Data",
      description: "Instructors securely upload student data including attendance, assignments, and assessments through an intuitive interface.",
      step: "01"
    },
    {
      icon: Cpu,
      title: "AI Processing & Analysis",
      description: "Advanced machine learning algorithms process the data to identify patterns, predict outcomes, and generate insights.",
      step: "02"
    },
    {
      icon: Eye,
      title: "Dashboard Insights",
      description: "Both faculty and students access personalized dashboards with actionable insights, progress tracking, and recommendations.",
      step: "03"
    }
  ];

  return (
    <section id="workflow" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How TrackIt{" "}
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A simple, powerful workflow that transforms raw academic data into 
            meaningful insights that drive student success and institutional excellence.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Workflow Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-6 animate-slide-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-gradient-primary mx-auto mt-4 opacity-30"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Diagram */}
          <div className="animate-fade-in">
            <div className="relative">
              <img
                src={workflowImage}
                alt="TrackIt Workflow Diagram"
                className="rounded-2xl shadow-strong w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-10"></div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-gradient-card border-border/50 hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-0">
              <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-secondary">85%</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Higher Accuracy</h3>
              <p className="text-muted-foreground">Improved prediction accuracy for student performance and risk identification.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 bg-gradient-card border-border/50 hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-0">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">60%</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Time Saved</h3>
              <p className="text-muted-foreground">Reduced administrative workload with automated insights and reporting.</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 bg-gradient-card border-border/50 hover:shadow-medium transition-all duration-300">
            <CardContent className="pt-0">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">95%</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">User Satisfaction</h3>
              <p className="text-muted-foreground">High adoption rates among faculty and students across institutions.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button variant="academic" size="lg" className="group" onClick={() => navigate('/auth')}>
            See TrackIt in Action
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};