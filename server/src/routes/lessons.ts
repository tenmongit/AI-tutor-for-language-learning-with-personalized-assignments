import express from "express";
import { getDatabase } from "../database";
import { auth } from "../middleware/auth";

const router = express.Router();

// Get all lessons for a language
router.get("/", async (req, res) => {
  try {
    const { languageId } = req.query;

    if (!languageId) {
      return res.status(400).json({ message: "Language ID is required" });
    }

    const db = await getDatabase();
    const lessons = await db.all(
      "SELECT * FROM lessons WHERE language_id = ? ORDER BY order_index",
      [languageId],
    );

    res.json(lessons);
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific lesson
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const lesson = await db.get("SELECT * FROM lessons WHERE id = ?", [id]);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(lesson);
  } catch (error) {
    console.error("Get lesson error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark a lesson as completed
router.post("/:id/complete", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = await getDatabase();

    // Check if lesson exists
    const lesson = await db.get("SELECT * FROM lessons WHERE id = ?", [id]);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // Check if already completed
    const completed = await db.get(
      "SELECT * FROM completed_lessons WHERE user_id = ? AND lesson_id = ?",
      [userId, id],
    );

    if (!completed) {
      // Mark as completed
      await db.run(
        "INSERT INTO completed_lessons (user_id, lesson_id) VALUES (?, ?)",
        [userId, id],
      );
    }

    res.json({ message: "Lesson marked as completed" });
  } catch (error) {
    console.error("Complete lesson error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
