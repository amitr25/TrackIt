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
    const { answers, questions, studentId, courseId } = await req.json();
    
    if (!answers || !questions || !studentId || !courseId) {
      throw new Error("Missing required fields");
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((question: any, index: number) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    console.log("Quiz results:", {
      studentId,
      courseId,
      correctAnswers,
      totalQuestions,
      score
    });

    // Update the quiz score in the database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('student_courses')
      .update({ quiz_score: score })
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (updateError) {
      console.error("Error updating quiz score:", updateError);
      throw new Error("Failed to update quiz score");
    }

    console.log("Quiz score updated successfully");

    // Trigger performance prediction after quiz completion
    try {
      const predictionResponse = await supabaseClient.functions.invoke('predict-performance', {
        body: { studentId, courseId }
      });
      
      if (predictionResponse.error) {
        console.error("Error predicting performance:", predictionResponse.error);
      } else {
        console.log("Performance prediction completed:", predictionResponse.data);
      }
    } catch (predictionError) {
      console.error("Error calling predict-performance:", predictionError);
      // Don't fail the quiz submission if prediction fails
    }

    return new Response(
      JSON.stringify({
        score,
        correctAnswers,
        totalQuestions,
        percentage: score
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in check-quiz-answers:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to check answers";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
