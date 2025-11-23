import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const JSON_FILE = "./userLogin.json";

// Initialize JSON file if it doesn't exist
try {
  await Deno.stat(JSON_FILE);
} catch {
  await Deno.writeTextFile(JSON_FILE, JSON.stringify([], null, 2));
  console.log("✓ Created userLogin.json");
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // POST - Save to JSON file
  if (url.pathname === "/login" && req.method === "POST") {
    try {
      const body = await req.json();
      const username = body.username?.trim();
      
      if (!username) {
        return new Response(JSON.stringify({ error: "Username required" }), { 
          status: 400, 
          headers 
        });
      }

      // Read existing data
      const fileContent = await Deno.readTextFile(JSON_FILE);
      const userData = JSON.parse(fileContent);

      // Add new login
      const newEntry = {
        username,
        time: new Date().toLocaleString()
      };
      userData.push(newEntry);

      // Save back to file
      await Deno.writeTextFile(JSON_FILE, JSON.stringify(userData, null, 2));
      
      console.log("✓ Saved:", newEntry);
      return new Response(JSON.stringify({ 
        status: "OK", 
        saved: true,
        data: newEntry 
      }), { headers });
      
    } catch (err) {
      console.error("✗ Error:", err);
      return new Response(JSON.stringify({ error: "Failed to save" }), { 
        status: 500, 
        headers 
      });
    }
  }

  // Serve HTML file
  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = await Deno.readTextFile("./index.html");
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    } catch {
      return new Response("index.html not found", { status: 404 });
    }
  }

  // Serve CSS file
  if (url.pathname === "/index.css") {
    try {
      const css = await Deno.readTextFile("./index.css");
      return new Response(css, {
        headers: { "Content-Type": "text/css" }
      });
    } catch {
      return new Response("index.css not found", { status: 404 });
    }
  }

  // Serve images
  if (url.pathname.startsWith("/image/")) {
    try {
      const imagePath = `.${url.pathname}`;
      const imageData = await Deno.readFile(imagePath);
      return new Response(imageData, {
        headers: { "Content-Type": "image/png" }
      });
    } catch {
      return new Response("Image not found", { status: 404 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

console.log("🦕 Deno server running on http://localhost:8000");
serve(handler, { port: 8000 });