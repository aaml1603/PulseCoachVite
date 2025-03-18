import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  Dumbbell,
  Save,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  AlertTriangle,
} from "lucide-react";
import ExerciseForm, { ExerciseFormValues } from "./ExerciseForm";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  notes?: string;
  order_index?: number;
}

const workoutSchema = z.object({
  title: z.string().min(2, { message: "Title is required" }),
  description: z.string().optional(),
  client_id: z.string().min(1, { message: "Please select a client" }),
  due_date: z.date({
    required_error: "Please select a due date",
  }),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

export default function WorkoutBuilder() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      description: "",
      client_id: "",
      due_date: new Date(),
    },
  });

  // Fetch clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, email");
        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        });
      }
    };

    const fetchSavedWorkouts = async () => {
      try {
        const { data, error } = await supabase
          .from("workouts")
          .select("id, title, client_id, status")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setSavedWorkouts(data || []);
      } catch (error) {
        console.error("Error fetching saved workouts:", error);
      }
    };

    fetchClients();
    fetchSavedWorkouts();
  }, [toast]);

  const handleExerciseSubmit = (data: ExerciseFormValues) => {
    if (editingExerciseIndex !== null) {
      // Update existing exercise
      const updatedExercises = [...exercises];
      updatedExercises[editingExerciseIndex] = {
        ...updatedExercises[editingExerciseIndex],
        ...data,
      };
      setExercises(updatedExercises);
    } else {
      // Add new exercise
      setExercises([...exercises, { ...data, order_index: exercises.length }]);
    }
    setIsExerciseDialogOpen(false);
    setEditingExerciseIndex(null);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === exercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...exercises];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newExercises[index], newExercises[newIndex]] = [
      newExercises[newIndex],
      newExercises[index],
    ];
    setExercises(newExercises);
  };

  const onSubmit = async (data: WorkoutFormValues) => {
    if (exercises.length === 0) {
      toast({
        title: "No exercises added",
        description: "Please add at least one exercise to the workout",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Insert workout
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .insert([
          {
            title: data.title,
            description: data.description,
            client_id: data.client_id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            due_date: data.due_date.toISOString(),
            status: "assigned",
          },
        ])
        .select();

      if (workoutError) throw workoutError;

      if (!workoutData || workoutData.length === 0) {
        throw new Error("Failed to create workout");
      }

      const workoutId = workoutData[0].id;

      // Insert exercises
      const exercisesWithWorkoutId = exercises.map((exercise, index) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_seconds: exercise.rest_seconds,
        notes: exercise.notes,
        order_index: index,
        workout_id: workoutId,
      }));

      const { error: exercisesError } = await supabase
        .from("exercises")
        .insert(exercisesWithWorkoutId);

      if (exercisesError) throw exercisesError;

      // No longer creating notification for client when workout is assigned

      toast({
        title: "Workout created",
        description: "The workout has been assigned to the client",
      });

      // Reset form
      form.reset();
      setExercises([]);

      // Refresh saved workouts list
      const { data: refreshedWorkouts } = await supabase
        .from("workouts")
        .select("id, title, client_id, status")
        .order("created_at", { ascending: false });

      setSavedWorkouts(refreshedWorkouts || []);
    } catch (error) {
      console.error("Error creating workout:", error);
      toast({
        title: "Error",
        description: "Failed to create workout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      setIsLoading(true);

      // First delete all exercises associated with this workout
      const { error: exercisesError } = await supabase
        .from("exercises")
        .delete()
        .eq("workout_id", workoutId);

      if (exercisesError) throw exercisesError;

      // Then delete the workout itself
      const { error: workoutError } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (workoutError) throw workoutError;

      // Refresh the workouts list
      const { data: refreshedWorkouts } = await supabase
        .from("workouts")
        .select("id, title, client_id, status")
        .order("created_at", { ascending: false });

      setSavedWorkouts(refreshedWorkouts || []);

      toast({
        title: "Workout deleted",
        description: "The workout has been permanently removed",
      });
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setWorkoutToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const loadWorkout = async (workoutId: string) => {
    try {
      setIsLoading(true);

      // Fetch workout details
      const { data: workoutData, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .single();

      if (workoutError) throw workoutError;

      // Fetch exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", workoutId)
        .order("order_index", { ascending: true });

      if (exercisesError) throw exercisesError;

      // Set form values
      form.setValue("title", workoutData.title);
      form.setValue("description", workoutData.description || "");
      form.setValue("client_id", workoutData.client_id);
      form.setValue("due_date", new Date(workoutData.due_date));

      // Set exercises
      setExercises(exercisesData || []);

      toast({
        title: "Workout loaded",
        description: "You can now edit and save as a new workout",
      });
    } catch (error) {
      console.error("Error loading workout:", error);
      toast({
        title: "Error",
        description: "Failed to load workout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedWorkout(null);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workout Builder</h1>

        <div className="flex gap-2">
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this workout? This action
                  cannot be undone and will remove all exercises associated with
                  this workout.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    workoutToDelete && deleteWorkout(workoutToDelete)
                  }
                  disabled={isLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isLoading ? "Deleting..." : "Delete Workout"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Select
            value={selectedWorkout || ""}
            onValueChange={(value) => {
              if (value) {
                setSelectedWorkout(value);
                loadWorkout(value);
              }
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Load saved workout" />
            </SelectTrigger>
            <SelectContent>
              {savedWorkouts.map((workout) => (
                <SelectItem key={workout.id} value={workout.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{workout.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value=""
            onValueChange={(value) => {
              if (value) {
                setWorkoutToDelete(value);
                setIsDeleteDialogOpen(true);
              }
            }}
          >
            <SelectTrigger className="w-[250px] border-destructive">
              <SelectValue placeholder="Delete workout" />
            </SelectTrigger>
            <SelectContent>
              {savedWorkouts.map((workout) => (
                <SelectItem key={workout.id} value={workout.id}>
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span>{workout.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
              <CardDescription>
                Create a personalized workout for your client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Full Body Strength"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the workout"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Exercises</CardTitle>
              <CardDescription>
                Build your workout by adding exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog
                open={isExerciseDialogOpen}
                onOpenChange={setIsExerciseDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Exercise
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingExerciseIndex !== null
                        ? "Edit Exercise"
                        : "Add Exercise"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingExerciseIndex !== null
                        ? "Make changes to the exercise"
                        : "Create a new exercise for this workout"}
                    </DialogDescription>
                  </DialogHeader>
                  <ExerciseForm
                    onSubmit={handleExerciseSubmit}
                    defaultValues={
                      editingExerciseIndex !== null
                        ? exercises[editingExerciseIndex]
                        : undefined
                    }
                    onCancel={() => setIsExerciseDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={isLoading || exercises.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Workout"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="mr-2 h-5 w-5" />
                Exercise List
              </CardTitle>
              <CardDescription>
                {exercises.length === 0
                  ? "No exercises added yet"
                  : `${exercises.length} exercise${exercises.length === 1 ? "" : "s"} in this workout`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                {exercises.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>Add exercises to build your workout</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exercises.map((exercise, index) => (
                      <Card key={index} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {exercise.name}
                            </CardTitle>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveExercise(index, "up")}
                                disabled={index === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveExercise(index, "down")}
                                disabled={index === exercises.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingExerciseIndex(index);
                                  setIsExerciseDialogOpen(true);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExercise(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">
                              {exercise.sets} sets
                            </Badge>
                            <Badge variant="outline">
                              {exercise.reps} reps
                            </Badge>
                            <Badge variant="outline">
                              {exercise.rest_seconds}s rest
                            </Badge>
                          </div>
                          {exercise.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {exercise.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
