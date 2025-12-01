import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-dashboard.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="min-h-screen flex items-center bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              {/* <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold text-primary">TrackIt</span> */}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-blue-400 mb-6 leading-tight">
              Academic Dashboard for{" "}
              <span className="bg-gradient-primary bg-clip-text text-green-300">
                Smarter Learning
              </span>
            </h1>
            
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              Transform scattered student data into powerful insights. TrackIt unifies attendance, 
              marks, and assignments into a comprehensive platform that predicts performance and 
              drives academic success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {/* <Button variant="hero" size="lg" className="group" onClick={() => navigate('/auth')}>
                Get Started with Azure Login
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
                View Demo Dashboard
              </Button> */}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-light rounded-full mb-2 mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">2 Roles</div>
                <div className="text-sm text-blue-200">Faculty & Students</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-secondary-light rounded-full mb-2 mx-auto">
                  <BarChart3 className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-foreground">360°</div>
                <div className="text-sm text-blue-200">Analytics View</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent-light rounded-full mb-2 mx-auto">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground">AI-Powered</div>
                <div className="text-sm text-blue-200">Predictions</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="animate-slide-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl opacity-20 animate-float"></div>
              <img
                src={heroImage}
                alt="TrackIt Academic Dashboard Interface"
                className="relative rounded-2xl shadow-strong w-full h-auto"
              />
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-card rounded-lg p-4 shadow-medium animate-float bg-blue-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm font-medium ">95% Accuracy</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-card rounded-lg p-4 shadow-medium animate-float bg-green-300" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm font-medium">Real-time Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};