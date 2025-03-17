import React, { useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WorkoutCompletionProps {
  workoutId: string;
  clientId: string;
  workoutName?: string;
  onComplete?: () => void;
}

const WorkoutCompletion = ({
  workoutId,
  clientId,
  workoutName = "Your Workout",
  onComplete,
}: WorkoutCompletionProps) => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const handleComplete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Call the workout-completion edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-workout-completion",
        {
          body: { workoutId, clientId, feedback },
        },
      );

      if (error) throw error;

      setIsCompleted(true);
      toast({
        title: "Workout completed!",
        description: "Your coach has been notified of your completion.",
        duration: 5000,
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error completing workout:", error);
      toast({
        title: "Error",
        description:
          "There was a problem marking your workout as complete. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-background">
        <CardHeader className="text-center">
          <CardTitle className="text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Workout Completed
          </CardTitle>
          <CardDescription>
            Your coach has been notified of your completion.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-background">
      <CardHeader>
        <CardTitle>{workoutName}</CardTitle>
        <CardDescription>
          Let your coach know how your workout went
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="How did this workout feel? Any challenges or achievements?"
          className="min-h-[100px]"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Mark as Complete"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutCompletion;
