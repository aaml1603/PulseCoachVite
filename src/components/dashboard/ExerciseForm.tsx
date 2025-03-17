import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const exerciseSchema = z.object({
  name: z.string().min(2, { message: "Exercise name is required" }),
  sets: z.coerce.number().min(1, { message: "At least 1 set is required" }),
  reps: z.coerce.number().min(1, { message: "At least 1 rep is required" }),
  rest_seconds: z.coerce
    .number()
    .min(0, { message: "Rest time cannot be negative" }),
  notes: z.string().optional(),
  category: z.string().optional(),
  save_to_library: z.boolean().optional(),
});

export type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface ExerciseFormProps {
  onSubmit: (data: ExerciseFormValues) => void;
  defaultValues?: Partial<ExerciseFormValues>;
  onCancel?: () => void;
}

export default function ExerciseForm({
  onSubmit,
  defaultValues = {
    name: "",
    sets: 3,
    reps: 10,
    rest_seconds: 60,
    notes: "",
    category: "Other",
    save_to_library: false,
  },
  onCancel,
}: ExerciseFormProps) {
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Barbell Squat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sets</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rest_seconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rest (seconds)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special instructions or form cues"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any specific instructions for this exercise
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Save Exercise</Button>
        </div>
      </form>
    </Form>
  );
}
