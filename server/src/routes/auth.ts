import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { getDatabase, hashPassword, comparePassword } from "../database";
import { auth } from "../middleware/auth";

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', { ...req.body, password: '[REDACTED]' });
    const { name, email, password } = req.body;

    // Enhanced input validation
    if (!name) {
      return res.status(400).json({ message: "Name is required", field: "name" });
    }
    
    if (!email) {
      return res.status(400).json({ message: "Email is required", field: "email" });
    }
    
    if (!password) {
      return res.status(400).json({ message: "Password is required", field: "password" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format", field: "email" });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters long", 
        field: "password" 
      });
    }

    console.log('Input validation passed');
    const db = await getDatabase();

    // Ensure the users table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if user already exists
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        message: "This email is already registered. Please use a different email or login.", 
        field: "email" 
      });
    }

    console.log('Hashing password...');
    // Hash password
    const hashedPassword = await hashPassword(password);

    console.log('Creating user...');
    // Create user
    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    if (!result || !result.lastID) {
      throw new Error('Failed to insert user into database');
    }

    console.log('User created with ID:', result.lastID);
    
    // Get the created user
    const user = await db.get(
      "SELECT id, name, email FROM users WHERE id = ?",
      [result.lastID],
    );

    if (!user) {
      throw new Error('User created but could not be retrieved');
    }

    // Create JWT token
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    console.log('Registration successful for:', email);
    
    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    
    // Provide more detailed error information
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ 
        message: "This email is already registered. Please use a different email or login.",
        field: "email" 
      });
    }
    
    res.status(500).json({ 
      message: error.message || "Server error during registration",
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const db = await getDatabase();

    // Find user
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user
router.get('/profile', auth, async (req: Request, res: Response) => {
  try {
    res.json(req.user);
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user (alternative endpoint for frontend compatibility)
router.get('/me', auth, async (req: Request, res: Response) => {
  try {
    res.json(req.user);
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
