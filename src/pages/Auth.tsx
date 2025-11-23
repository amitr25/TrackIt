import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, UserCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithAzure, user, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleAzureSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithAzure();
    setIsLoading(false);

    if (!error) {
      // OAuth redirects automatically, no need to manually navigate
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-foreground">TrackIt</span>
                <div className="text-sm text-slate-300">Academic Dashboard</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to TrackIt</h1>
            <p className="text-slate-300">
              Sign in with your KRMU Azure account to access your academic dashboard
            </p>
          </div>

          <Card className="shadow-strong border-border/50 backdrop-blur-sm bg-card/80">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Azure Authentication</CardTitle>
              <CardDescription>
                Use your KRMU Microsoft account to sign in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Azure Sign In Button */}
              <Button 
                onClick={handleAzureSignIn}
                className="w-full" 
                variant="hero"
                size="lg"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 0h11v11H0V0zm13 0h11v11H13V0zM0 13h11v11H0V13zm13 0h11v11H13V13z"/>
                </svg>
                {isLoading ? 'Connecting to Azure...' : 'Sign in with Microsoft Azure'}
              </Button>

              {/* Role Information */}
              <div className="space-y-3">
                <div className="text-center text-sm font-medium text-muted-foreground">
                  Role Assignment Based on Email:
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground">Student Access</div>
                      <div className="text-xs text-muted-foreground">Format: 1234567890@krmu.edu.in</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                    <UserCheck className="h-5 w-5 text-secondary flex-shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground">Faculty Access</div>
                      <div className="text-xs text-muted-foreground">Format: name@krmangalam.edu.in</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="text-center p-3 rounded-lg bg-muted/50 border">
                <div className="text-xs text-muted-foreground">
                  <strong>Secure Authentication:</strong> Your credentials are managed by Microsoft Azure Active Directory. 
                  Role assignment is automatic based on your email format.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="mt-6 text-center">
            <div className="text-sm text-slate-300">
              Need help? Contact your IT administrator or check the{' '}
              <span className="text-primary font-medium">KRMU IT Support</span> portal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;