import express, { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { getDatabase, hashPassword, comparePassword } from "../database";
import { auth } from "../middleware/auth";

const router = express.Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    // Get the created user
    const user = await db.get(
      "SELECT id, name, email FROM users WHERE id = ?",
      [result.lastID],
    );

    // Create JWT token
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
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
