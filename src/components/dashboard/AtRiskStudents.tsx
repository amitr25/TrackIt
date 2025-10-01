import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AtRiskStudent {
  student_id: string;
  student_name: string;
  student_email: string;
  course_name: string;
  risk_factors: string[];
  risk_level: 'high' | 'medium' | 'low';
}

export const AtRiskStudents = () => {
  const { user } = useAuth();
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      identifyAtRiskStudents();
    }
  }, [user]);

  const identifyAtRiskStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('faculty_id', user?.id);

      if (error) throw error;

      // Analyze students for risk factors
      const riskAnalysis: AtRiskStudent[] = [];
      
      data?.forEach(record => {
        const riskFactors: string[] = [];
        let riskLevel: 'high' | 'medium' | 'low' = 'low';

        // Check attendance
        if (record.attendance < 75) {
          riskFactors.push(`Low attendance (${record.attendance}%)`);
        }

        // Check mid-term performance
        if (record.mid_term_marks < 40) {
          riskFactors.push(`Poor mid-term marks (${record.mid_term_marks})`);
        }

        // Check assignments
        if (record.assignments < 50) {
          riskFactors.push(`Low assignment score (${record.assignments})`);
        }

        // Check predicted grade
        if (record.predicted_grade && ['D', 'F'].includes(record.predicted_grade)) {
          riskFactors.push(`At-risk grade (${record.predicted_grade})`);
        }

        // Determine risk level
        if (riskFactors.length >= 3) {
          riskLevel = 'high';
        } else if (riskFactors.length >= 2) {
          riskLevel = 'medium';
        } else if (riskFactors.length > 0) {
          riskLevel = 'low';
        }

        // Add to list if there are any risk factors
        if (riskFactors.length > 0) {
          riskAnalysis.push({
            student_id: record.student_id,
            student_name: record.student_name,
            student_email: record.student_email,
            course_name: record.course_name,
            risk_factors: riskFactors,
            risk_level: riskLevel
          });
        }
      });

      // Sort by risk level (high first)
      riskAnalysis.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.risk_level] - order[b.risk_level];
      });

      setAtRiskStudents(riskAnalysis);
    } catch (error) {
      console.error('Error analyzing at-risk students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    if (level === 'high') return 'destructive';
    if (level === 'medium') return 'default';
    return 'secondary';
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          At-Risk Students ({atRiskStudents.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Students identified as needing additional support based on performance metrics
        </p>
      </CardHeader>
      <CardContent>
        {atRiskStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No students identified as at-risk at this time.</p>
            <p className="text-sm mt-2">All students are performing adequately.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {atRiskStudents.map((student, index) => (
              <div key={`${student.student_id}-${index}`} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{student.student_name}</h4>
                      <Badge variant={getRiskBadgeVariant(student.risk_level)}>
                        {student.risk_level.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.student_id} • {student.student_email}
                    </p>
                    <p className="text-sm font-medium mt-1">{student.course_name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Risk Factors:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {student.risk_factors.map((factor, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
