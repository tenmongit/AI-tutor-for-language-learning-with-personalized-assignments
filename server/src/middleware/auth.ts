import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDatabase } from "../database";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = jwt.verify(token, secret) as { userId: number };

    // Get user from database
    const db = await getDatabase();
    const user = await db.get(
      "SELECT id, name, email FROM users WHERE id = ?",
      [decoded.userId],
    );

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
