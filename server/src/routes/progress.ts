import express from "express";
import { getDatabase } from "../database";
import { auth } from "../middleware/auth";

const router = express.Router();

// Get user progress for a language
router.get("/", auth, async (req, res) => {
  try {
    const { languageId } = req.query;
    
    // Explicit null check for req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    if (!languageId) {
      return res.status(400).json({ message: "Language ID is required" });
    }

    const db = await getDatabase();

    // Get all lessons for the language
    const lessons = await db.all(
      "SELECT * FROM lessons WHERE language_id = ? ORDER BY order_index",
      [languageId],
    );

    // Get completed lessons
    const completedLessons = await db.all(
      "SELECT lesson_id FROM completed_lessons WHERE user_id = ?",
      [userId],
    );

    const completedLessonIds = completedLessons.map(
      (lesson: any) => lesson.lesson_id,
    );

    // Get progress for each lesson
    const lessonProgress = await Promise.all(
      lessons.map(async (lesson: any) => {
        // Check if completed
        const completed = completedLessonIds.includes(lesson.id);

        // Check if started (has any progress)
        const progress = await db.get(
          "SELECT COUNT(*) as count FROM user_progress WHERE user_id = ? AND lesson_id = ?",
          [userId, lesson.id],
        );

        const started = progress.count > 0;

        // Determine if available (first lesson or previous lesson completed)
        let available = false;
        if (lesson.order_index === 1) {
          available = true;
        } else {
          const previousLesson = lessons.find(
            (l: any) => l.order_index === lesson.order_index - 1,
          );
          if (
            previousLesson &&
            completedLessonIds.includes(previousLesson.id)
          ) {
            available = true;
          }
        }

        return {
          lessonId: lesson.id,
          completed,
          started,
          available,
        };
      }),
    );

    res.json({
      totalLessons: lessons.length,
      completedLessons: completedLessonIds.length,
      lessons: lessonProgress,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save user progress for an exercise
router.post("/", auth, async (req, res) => {
  try {
    const { lessonId, exerciseId, isCorrect } = req.body;
    
    // Explicit null check for req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    if (!lessonId || !exerciseId) {
      return res
        .status(400)
        .json({ message: "Lesson ID and Exercise ID are required" });
    }

    const db = await getDatabase();

    // Save progress
    await db.run(
      "INSERT INTO user_progress (user_id, lesson_id, exercise_id, is_correct) VALUES (?, ?, ?, ?)",
      [userId, lessonId, exerciseId, isCorrect ? 1 : 0],
    );

    res.json({ message: "Progress saved successfully" });
  } catch (error) {
    console.error("Save progress error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
