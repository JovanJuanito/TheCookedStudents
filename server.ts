// server.ts
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const JSON_FILE = "./userLogin.json";

// Initialize JSON file if it doesn't exist
try {
  await Deno.stat(JSON_FILE);
} catch {
  await Deno.writeTextFile(JSON_FILE, JSON.stringify([], null, 2));
  console.log("✓ Created userLogin.json");
}

// Helper: Get MIME type based on file extension
function getContentType(path: string): string {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".mp3")) return "audio/mpeg";
  if (path.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // POST /login — save or update user login
  if (url.pathname === "/login" && req.method === "POST") {
    try {
      const body = await req.json();
      const username = typeof body.username === "string" ? body.username.trim() : "";

      if (!username) {
        return new Response(JSON.stringify({ error: "Username required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Read existing logins
      const fileContent = await Deno.readTextFile(JSON_FILE);
      const userData: Array<{ username: string; time: string }> = JSON.parse(fileContent);

      const newEntry = {
        username,
        time: new Date().toLocaleString(),
      };

      // Check if user exists
      const existingIndex = userData.findIndex((user) => user.username === username);

      if (existingIndex !== -1) {
        userData[existingIndex] = newEntry; // update timestamp
        console.log("✓ Updated:", newEntry);
      } else {
        userData.push(newEntry); // add new user
        console.log("✓ Added:", newEntry);
      }

      // Write back
      await Deno.writeTextFile(JSON_FILE, JSON.stringify(userData, null, 2));

      return new Response(
        JSON.stringify({
          status: "OK",
          saved: true,
          data: newEntry,
          updated: existingIndex !== -1,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("✗ Login error:", err);
      return new Response(JSON.stringify({ error: "Failed to process login" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Serve static files
  const filePath = url.pathname === "/" ? "./index.html" : `.${url.pathname}`;

  try {
    const fileBytes = await Deno.readFile(filePath);
    const contentType = getContentType(filePath);
    return new Response(fileBytes, {
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return new Response("404 Not Found", { status: 404 });
    }
    console.error("File read error:", err);
    return new Response("500 Internal Server Error", { status: 500 });
  }
}

console.log("🦕 Deno server running on http://localhost:8000");
await serve(handler, { port: 8000 });
