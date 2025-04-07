import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Function to hash existing plain text passwords
async function hashExistingPasswords() {
  try {
    console.log("Checking for passwords that need hashing...");
    
    // Get all users
    const existingUsers = await db.select().from(users);
    
    // Loop through each user and hash their password if it's not already hashed
    for (const user of existingUsers) {
      // Check if password is already hashed (contains a dot separator)
      if (!user.password.includes('.')) {
        console.log(`Hashing password for user ${user.username}`);
        const hashedPassword = await hashPassword(user.password);
        
        // Update the user's password in the database
        await db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id));
      }
    }
    
    console.log("Password check complete!");
  } catch (error) {
    console.error("Error checking passwords:", error);
  }
}

(async () => {
  // Hash existing passwords before starting the server
  await hashExistingPasswords();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
