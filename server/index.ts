import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { validateEnvironment } from "./validateEnv";

// Validate environment variables before starting the server
console.log('🔍 Validating environment configuration...');
validateEnvironment();

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

// Register routes and middleare
const setupPromise = (async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup vite or static serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ONLY start the listener if we're not running as a Vercel function
  if (process.env.VERCEL !== "1") {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`🚀 Pooja Academy is LIVE on port ${port}`);
      // Keep-alive log
      setInterval(() => log("💓 Server heartbeat: active"), 300000); // Every 5 mins
    });
  }

  return app;
})();

export { app, setupPromise };
export default app;


