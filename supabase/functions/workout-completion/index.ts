// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/manual/getting_started/javascript_runtime

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { workoutId, clientId, feedback } = await req.json();

    if (!workoutId || !clientId) {
      throw new Error("Workout ID and Client ID are required");
    }

    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Get the workout details
    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("workouts")
      .select("*, coach:user_id(id, email)")
      .eq("id", workoutId)
      .single();

    if (workoutError) {
      throw new Error(`Error fetching workout: ${workoutError.message}`);
    }

    if (!workout) {
      throw new Error("Workout not found");
    }

    // Get client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .single();

    if (clientError) {
      throw new Error(`Error fetching client: ${clientError.message}`);
    }

    // Update workout with feedback and mark as completed
    const { error: updateError } = await supabaseAdmin
      .from("workouts")
      .update({
        feedback: feedback || "",
        completed_at: new Date().toISOString(),
      })
      .eq("id", workoutId);

    if (updateError) {
      throw new Error(`Error updating workout: ${updateError.message}`);
    }

    // Create notification for the coach
    const { error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: workout.coach.id,
        client_id: clientId,
        title: "Workout Completed",
        message: feedback
          ? `${client.name} completed the workout: ${workout.name} and left feedback: "${feedback}"`
          : `${client.name} completed the workout: ${workout.name}`,
        type: "workout_completion",
        read: false,
      });

    if (notificationError) {
      throw new Error(
        `Error creating notification: ${notificationError.message}`,
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
