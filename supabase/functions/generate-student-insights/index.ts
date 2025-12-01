import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courses, detailed } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const coursesSummary = courses.map((c: any) => ({
      name: c.course_name,
      credits: c.credits,
      midTerm: c.mid_term_marks,
      attendance: c.attendance,
      assignments: c.assignments,
      quizScore: c.quiz_score,
      predictedGrade: c.predicted_grade,
      predictedEndTerm: c.predicted_end_term_marks
    }));

    const prompt = detailed 
      ? `Analyze this student's academic performance in detail and provide comprehensive, actionable insights. Be specific and reference actual course names and metrics.

Course Data: ${JSON.stringify(coursesSummary, null, 2)}

Provide a detailed analysis covering:
1. Overall academic standing and trajectory
2. Specific strengths in individual courses with concrete evidence
3. Areas needing immediate attention with specific action steps
4. Attendance patterns and their impact on performance
5. Assignment completion correlation with grades
6. Quiz performance analysis
7. Predicted grade trends and what they indicate
8. Specific recommendations for each course
9. Time management and study strategy suggestions
10. Long-term academic planning advice

Format each insight as a clear, actionable point.`
      : `Analyze this student's academic performance and provide 5-7 concise, actionable insights.

Course Data: ${JSON.stringify(coursesSummary, null, 2)}

Focus on:
- Overall performance assessment
- Key strengths
- Critical areas needing attention
- Attendance concerns
- Top priority actions

Format as brief, actionable bullet points.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an academic advisor AI providing personalized insights to students. Be encouraging but honest, specific with data, and always actionable."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact your administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate insights" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
