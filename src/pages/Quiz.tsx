import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Award } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const courseName = searchParams.get("course");
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");

  const [difficulty, setDifficulty] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startQuiz = async () => {
    if (!difficulty) {
      toast({
        title: "Select Difficulty",
        description: "Please select a difficulty level to start the quiz.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { courseName, difficulty }
      });

      if (error) throw error;

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
        setQuizStarted(true);
      } else {
        throw new Error("No questions generated");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-quiz-answers", {
        body: {
          answers,
          questions,
          studentId,
          courseId
        }
      });

      if (error) throw error;

      setResult(data);
      setShowResult(true);
      
      toast({
        title: "Quiz Submitted!",
        description: `You scored ${data.score}%`,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exitQuiz = () => {
    navigate("/dashboard");
  };

  if (!courseName || !courseId || !studentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Quiz Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This quiz link is invalid. Please return to your dashboard.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-primary">
                {result.percentage}%
              </div>
              <p className="text-xl text-muted-foreground">
                You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly
              </p>
            </div>
            
            <div className="bg-secondary/20 p-6 rounded-lg space-y-2">
              <h3 className="font-semibold text-lg">Course: {courseName}</h3>
              <p className="text-muted-foreground">Difficulty: {difficulty}</p>
              <p className="text-muted-foreground">
                Your score has been saved and will be visible to your instructor.
              </p>
            </div>

            <Button onClick={exitQuiz} className="w-full" size="lg">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl mb-2">Quiz Setup</CardTitle>
            <p className="text-muted-foreground">Course: {courseName}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="difficulty" className="text-base">Select Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="mt-2">
                    <SelectValue placeholder="Choose difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Quiz Information:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>15 multiple choice questions</li>
                  <li>AI-generated questions based on your course</li>
                  <li>Your score will be saved automatically</li>
                  <li>Results will be visible to your instructor</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={startQuiz} 
              disabled={loading || !difficulty}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                "Start Quiz"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
              <span className="text-sm text-muted-foreground">{courseName}</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-secondary/20 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
              
              <RadioGroup 
                value={answers[currentQuestion]?.toString()} 
                onValueChange={(value) => handleAnswer(parseInt(value))}
              >
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between gap-4">
              <Button 
                onClick={handlePrevious} 
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              {currentQuestion === questions.length - 1 ? (
                <Button 
                  onClick={submitQuiz} 
                  disabled={loading || answers.includes(-1)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {answers.filter(a => a !== -1).length} of {questions.length} questions answered
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
