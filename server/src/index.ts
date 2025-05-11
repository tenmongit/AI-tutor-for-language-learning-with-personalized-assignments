import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database";
import authRoutes from "./routes/auth";
import languageRoutes from "./routes/languages";
import lessonRoutes from "./routes/lessons";
import exerciseRoutes from "./routes/exercises";
import progressRoutes from "./routes/progress";
import chatRouter from "./routes/chat";

// Load environment variables
dotenv.config();

// Set default environment variables if not set
process.env.PORT = process.env.PORT || '5000';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key_here';
process.env.DATABASE_PATH = process.env.DATABASE_PATH || './database.sqlite';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
