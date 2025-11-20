import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentId, courseId } = await req.json();
    
    if (!studentId || !courseId) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get student's course data
    const { data: studentCourse, error: courseError } = await supabaseClient
      .from('student_courses')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (courseError || !studentCourse) {
      console.error("Error fetching student course:", courseError);
      throw new Error("Student course not found");
    }

    // Calculate course difficulty based on average mid-term marks
    const { data: allCourseStudents, error: avgError } = await supabaseClient
      .from('student_courses')
      .select('mid_term_marks')
      .eq('course_id', courseId);

    if (avgError) {
      console.error("Error calculating course difficulty:", avgError);
      throw new Error("Failed to calculate course difficulty");
    }

    const avgMidTerm = allCourseStudents.reduce((sum, s) => sum + Number(s.mid_term_marks), 0) / allCourseStudents.length;
    
    let courseDifficulty = 'medium';
    if (avgMidTerm >= 15) courseDifficulty = 'easy';
    else if (avgMidTerm < 10) courseDifficulty = 'hard';

    // Prepare data for AI prediction
    const promptData = {
      midTermMarks: studentCourse.mid_term_marks,
      assignments: studentCourse.assignments,
      attendance: studentCourse.attendance,
      quizScore: studentCourse.quiz_score || 0,
      courseDifficulty,
      avgMidTermOfCourse: avgMidTerm.toFixed(2)
    };

    console.log("Predicting performance for:", promptData);

    // Call Lovable AI to predict end term marks
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an academic performance prediction expert. Predict end term exam marks (out of 50) based on student's current performance. Consider all factors comprehensively. Return ONLY a number between 0 and 50, nothing else.`
          },
          {
            role: 'user',
            content: `Predict end term marks (out of 50) for a student with:
- Mid-term marks: ${promptData.midTermMarks}/20
- Assignments: ${promptData.assignments}/10
- Attendance: ${promptData.attendance}%
- Quiz score: ${promptData.quizScore}%
- Course difficulty: ${courseDifficulty} (average mid-term: ${promptData.avgMidTermOfCourse}/20)

Consider:
1. Strong mid-term performance indicates good understanding
2. High attendance and assignment scores show dedication
3. Quiz score reflects recent preparation level
4. Course difficulty affects expected performance
5. Balance all factors for realistic prediction

Return only the predicted marks as a number (0-50).`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", await aiResponse.text());
      throw new Error("Failed to get AI prediction");
    }

    const aiData = await aiResponse.json();
    const predictedEndTermText = aiData.choices[0].message.content.trim();
    const predictedEndTerm = Math.min(50, Math.max(0, parseFloat(predictedEndTermText) || 0));

    console.log("AI predicted end term marks:", predictedEndTerm);

    // Calculate total marks and grade
    // Total = 20(midterm) + 10(assignments) + 10(attendance component) + 10(quiz component) + 50(end term) = 100
    const midTermScore = Number(studentCourse.mid_term_marks); // out of 20
    const assignmentScore = Number(studentCourse.assignments); // out of 10
    const attendanceScore = (Number(studentCourse.attendance) * 0.1); // convert % to 10 marks
    const quizInternalScore = ((studentCourse.quiz_score || 0) * 0.1); // convert % to 10 marks
    
    const totalMarks = midTermScore + assignmentScore + attendanceScore + quizInternalScore + predictedEndTerm;
    
    console.log("Total marks breakdown:", {
      midTerm: midTermScore,
      assignment: assignmentScore,
      attendance: attendanceScore,
      quiz: quizInternalScore,
      endTerm: predictedEndTerm,
      total: totalMarks
    });

    // Determine grade and GP
    let grade = 'F';
    let gradePoint = 0;

    if (totalMarks >= 91) {
      grade = 'O';
      gradePoint = 10;
    } else if (totalMarks >= 81) {
      grade = 'A+';
      gradePoint = 9;
    } else if (totalMarks >= 71) {
      grade = 'A';
      gradePoint = 8;
    } else if (totalMarks >= 61) {
      grade = 'B+';
      gradePoint = 7;
    } else if (totalMarks >= 51) {
      grade = 'B';
      gradePoint = 6;
    } else if (totalMarks >= 46) {
      grade = 'C';
      gradePoint = 5;
    } else if (totalMarks >= 40) {
      grade = 'P';
      gradePoint = 4;
    }

    console.log("Predicted grade:", grade, "GP:", gradePoint);

    // Update student_courses with predictions
    const { error: updateError } = await supabaseClient
      .from('student_courses')
      .update({
        predicted_end_term_marks: predictedEndTerm,
        predicted_grade: `${grade} (GP: ${gradePoint}, Total: ${totalMarks.toFixed(2)}/100)`
      })
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (updateError) {
      console.error("Error updating predictions:", updateError);
      throw new Error("Failed to update predictions");
    }

    // Calculate SGPA for the semester
    const { data: semesterCourses, error: semesterError } = await supabaseClient
      .from('student_courses')
      .select('credits, predicted_grade, semester')
      .eq('student_id', studentId)
      .eq('semester', studentCourse.semester);

    let sgpa = 0;
    if (!semesterError && semesterCourses) {
      let totalCredits = 0;
      let totalGradePoints = 0;

      semesterCourses.forEach(course => {
        if (course.predicted_grade) {
          // Extract GP from predicted_grade string
          const gpMatch = course.predicted_grade.match(/GP:\s*(\d+)/);
          if (gpMatch) {
            const gp = parseInt(gpMatch[1]);
            totalGradePoints += course.credits * gp;
            totalCredits += course.credits;
          }
        }
      });

      if (totalCredits > 0) {
        sgpa = totalGradePoints / totalCredits;
      }
    }

    console.log("Performance prediction completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        predictedEndTerm,
        totalMarks: totalMarks.toFixed(2),
        grade,
        gradePoint,
        sgpa: sgpa.toFixed(2)
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in predict-performance:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to predict performance";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});