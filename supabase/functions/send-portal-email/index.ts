import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { clientId, clientEmail, clientName, portalUrl, coachName } =
      await req.json();

    if (!clientId || !clientEmail || !portalUrl) {
      throw new Error("Missing required parameters");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get SendGrid API key from environment variable
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Your Fitness Portal</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 15px;
          }
          h1 {
            color: #1f2937;
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          p {
            margin: 0 0 15px;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .highlight {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Personal Fitness Portal</h1>
          </div>
          <div class="content">
            <p>Hello ${clientName || "there"},</p>
            <p>${coachName || "Your coach"} has created a personal fitness portal for you to access your workouts and track your progress.</p>
            
            <div class="highlight">
              <p>Your portal gives you access to:</p>
              <ul>
                <li>Your personalized workout plans</li>
                <li>Progress tracking</li>
                <li>Direct messaging with your coach</li>
                <li>Exercise instructions and videos</li>
              </ul>
            </div>
            
            <p>Click the button below to access your portal:</p>
            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Access Your Portal</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 14px; color: #6b7280;">${portalUrl}</p>
            
            <p>If you have any questions, please contact your coach directly.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using SendGrid API
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: clientEmail, name: clientName || clientEmail }],
          },
        ],
        from: {
          email: "noreply@yourfitnessapp.com", // Replace with your verified sender
          name: coachName || "Fitness Coach",
        },
        subject: "Your Personal Fitness Portal",
        content: [
          {
            type: "text/html",
            value: emailHtml,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("SendGrid API error:", errorData);
      throw new Error(
        `Failed to send email: ${response.status} ${response.statusText}`,
      );
    }

    // Log the email sent in the database
    const { error: logError } = await supabase.from("email_logs").insert([
      {
        client_id: clientId,
        email_type: "portal_invitation",
        recipient_email: clientEmail,
        sent_at: new Date().toISOString(),
        status: "sent",
      },
    ]);

    if (logError) {
      console.error("Error logging email:", logError);
      // Continue execution even if logging fails
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
