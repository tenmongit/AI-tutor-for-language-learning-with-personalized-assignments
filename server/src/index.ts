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
import { diagnoseDatabaseIssues, fixDatabaseIssues } from "./utils/diagnostics";

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
// More permissive CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Standard CORS middleware as backup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Initialize database with better error handling
async function setupDatabase() {
  try {
    console.log("Initializing database...");
    await initializeDatabase();
    console.log("Database initialization completed.");
    
    // Run diagnostics to verify database integrity
    console.log("Running database diagnostics...");
    const diagnosticsResult = await diagnoseDatabaseIssues();
    
    if (!diagnosticsResult) {
      console.log("Attempting to fix database issues...");
      await fixDatabaseIssues();
      console.log("Database fixes applied.");
    }
    
    return true;
  } catch (error) {
    console.error("Database setup failed:", error);
    return false;
  }
}

// Initialize database
setupDatabase().then(success => {
  if (!success) {
    console.error("WARNING: Database setup had issues. The application may not function correctly.");
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/chat", chatRouter);

// Health check route with database status
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await diagnoseDatabaseIssues();
    
    res.status(200).json({ 
      status: "ok",
      database: dbStatus ? "connected" : "issues detected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Server health check failed",
      timestamp: new Date().toISOString()
    });
  }
});

// Debug route for database diagnostics (development only)
app.get("/api/debug/database", async (req, res) => {
  try {
    const diagnosticsResult = await diagnoseDatabaseIssues();
    res.status(200).json({ success: true, diagnosticsResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
  }
});

// Debug route to fix database issues (development only)
app.get("/api/debug/fix-database", async (req, res) => {
  try {
    const fixResult = await fixDatabaseIssues();
    res.status(200).json({ success: true, fixResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
