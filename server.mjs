import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path"; // Add this import
import studentRoutes from "./routes/students.mjs";
import courseRoutes from "./routes/courses.mjs";
import rewardRoutes from "./routes/rewards.mjs";
import challengeRoutes from "./routes/challenges.mjs";
import { connectToDatabase } from "./config/db.mjs";

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection and server startup
connectToDatabase()
  .then(() => {
    // Routes (moved inside to ensure DB connection before handling requests)
    app.use("/api/students", studentRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/rewards", rewardRoutes);
    app.use("/api/challenges", challengeRoutes);

    // Serve frontend in production
    if (process.env.NODE_ENV === "production") {
      // Get the directory name using the file URL
      const __dirname = path.dirname(new URL(import.meta.url).pathname);

      // Serve static files from the frontend build directory
      app.use(express.static(path.join(__dirname, "frontend/build")));

      // Handle React routing, return all requests to React app
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
      });
    }

    // Start your server after DB connection is established
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit process with failure
  });
