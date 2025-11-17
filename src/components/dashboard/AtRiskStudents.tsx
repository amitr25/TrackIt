import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StudentDetailModal } from "./StudentDetailModal";

interface AtRiskStudent {
  student_id: string;
  student_name: string;
  student_email: string;
  courses: {
    course_name: string;
    risk_factors: string[];
    risk_level: 'high' | 'medium' | 'low';
  }[];
  overall_risk_level: 'high' | 'medium' | 'low';
}

export const AtRiskStudents = () => {
  const { user } = useAuth();
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      identifyAtRiskStudents();
    }
  }, [user]);

  const extractGradeFromPrediction = (predictedGrade: string | null): string => {
    if (!predictedGrade) return '';
    const gradeMatch = predictedGrade.match(/^([A-Z+]+)/);
    return gradeMatch ? gradeMatch[1] : '';
  };

  const identifyAtRiskStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('faculty_id', user?.id);

      if (error) throw error;

      // Group by student and analyze risk factors
      const studentMap = new Map<string, AtRiskStudent>();
      
      data?.forEach(record => {
        const riskFactors: string[] = [];
        let riskLevel: 'high' | 'medium' | 'low' = 'low';
        
        // Extract grade from predicted_grade string
        const grade = extractGradeFromPrediction(record.predicted_grade);
        
        // Determine risk level based on grade first
        let gradeRiskLevel: 'high' | 'low' | 'none' = 'none';
        
        if (grade === 'P' || grade === 'F') {
          gradeRiskLevel = 'high';
          riskFactors.push(`High risk grade (${grade})`);
        } else if (grade === 'C' || grade === 'B+') {
          gradeRiskLevel = 'low';
          riskFactors.push(`Low risk grade (${grade})`);
        } else if (grade === 'O' || grade === 'A+' || grade === 'A' || grade === 'B') {
          // Not at risk for this course - skip
          return;
        }

        // Check attendance (less than 75%)
        if (record.attendance < 75) {
          riskFactors.push(`Low attendance (${record.attendance}%)`);
        }

        // Check mid-term performance (less than 8 out of 20)
        if (record.mid_term_marks < 8) {
          riskFactors.push(`Poor mid-term marks (${record.mid_term_marks}/20)`);
        }

        // Check assignments (less than 5 out of 10)
        if (record.assignments < 5) {
          riskFactors.push(`Low assignment score (${record.assignments}/10)`);
        }

        // Check quiz score (less than 50%)
        if (record.quiz_score && record.quiz_score < 50) {
          riskFactors.push(`Low quiz score (${record.quiz_score}%)`);
        }

        // Determine final risk level based on grade and other factors
        if (gradeRiskLevel === 'high') {
          riskLevel = 'high';
        } else if (gradeRiskLevel === 'low') {
          riskLevel = 'low';
        } else if (riskFactors.length >= 3) {
          riskLevel = 'high';
        } else if (riskFactors.length >= 2) {
          riskLevel = 'medium';
        } else if (riskFactors.length > 0) {
          riskLevel = 'low';
        }

        // Skip if no risk factors
        if (riskFactors.length === 0) return;

        // Group by student
        const studentKey = record.student_id;
        if (!studentMap.has(studentKey)) {
          studentMap.set(studentKey, {
            student_id: record.student_id,
            student_name: record.student_name,
            student_email: record.student_email,
            courses: [],
            overall_risk_level: riskLevel
          });
        }

        const student = studentMap.get(studentKey)!;
        student.courses.push({
          course_name: record.course_name,
          risk_factors: riskFactors,
          risk_level: riskLevel
        });

        // Update overall risk level (take highest risk)
        if (riskLevel === 'high' || student.overall_risk_level === 'high') {
          student.overall_risk_level = 'high';
        } else if (riskLevel === 'medium' || student.overall_risk_level === 'medium') {
          student.overall_risk_level = 'medium';
        }
      });

      const riskAnalysis = Array.from(studentMap.values());

      // Sort by risk level (high first)
      riskAnalysis.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.overall_risk_level] - order[b.overall_risk_level];
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

  // Filter students based on search query
  const filteredStudents = atRiskStudents.filter(student => 
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.courses.some(course => course.course_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStudentClick = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <>
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                At-Risk Students ({atRiskStudents.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Students identified as needing additional support based on performance metrics
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {/* Search Bar */}
            {atRiskStudents.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, email, or course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchQuery && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing {filteredStudents.length} of {atRiskStudents.length} students
                  </p>
                )}
              </div>
            )}

            {atRiskStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students identified as at-risk at this time.</p>
                <p className="text-sm mt-2">All students are performing adequately.</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student, index) => (
                  <div key={`${student.student_id}-${index}`} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() =>
                                handleStudentClick(
                                  student.student_id,
                                  student.student_name
                                )
                              }
                              className="font-medium text-primary hover:underline cursor-pointer text-left"
                            >
                              {student.student_name}
                            </button>
                            <Badge variant={getRiskBadgeVariant(student.overall_risk_level)}>
                              {student.overall_risk_level.toUpperCase()} RISK
                            </Badge>
                            <Badge variant="outline">
                              {student.courses.length} {student.courses.length === 1 ? 'Course' : 'Courses'}
                            </Badge>
                          </div>
                        <p className="text-sm text-muted-foreground">
                          {student.student_id} • {student.student_email}
                        </p>
                      </div>
                    </div>
                    
                    {/* Courses at risk */}
                    <div className="space-y-3 mt-3">
                      {student.courses.map((course, courseIdx) => (
                        <div key={courseIdx} className="bg-muted/30 rounded-md p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{course.course_name}</p>
                            <Badge variant={getRiskBadgeVariant(course.risk_level)} className="text-xs">
                              {course.risk_level.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Risk Factors:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {course.risk_factors.map((factor, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span className="h-1 w-1 rounded-full bg-destructive" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>

  {selectedStudent && (
    <StudentDetailModal
      studentId={selectedStudent.id}
      studentName={selectedStudent.name}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
    />
  )}
  </>
);
};
