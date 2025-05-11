import express from "express";
import { getDatabase } from "../database";
import { auth } from "../middleware/auth";

const router = express.Router();

// Get exercises for a lesson
router.get("/", async (req, res) => {
  try {
    const { lessonId } = req.query;

    if (!lessonId) {
      return res.status(400).json({ message: "Lesson ID is required" });
    }

    const db = await getDatabase();
    const exercises = await db.all(
      "SELECT * FROM exercises WHERE lesson_id = ? ORDER BY difficulty",
      [lessonId],
    );

    // Parse options if they exist
    const formattedExercises = exercises.map((exercise: any) => ({
      ...exercise,
      options: exercise.options ? JSON.parse(exercise.options) : null,
    }));

    res.json(formattedExercises);
  } catch (error) {
    console.error("Get exercises error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific exercise
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const exercise = await db.get("SELECT * FROM exercises WHERE id = ?", [id]);

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    // Parse options if they exist
    if (exercise.options) {
      exercise.options = JSON.parse(exercise.options);
    }

    res.json(exercise);
  } catch (error) {
    console.error("Get exercise error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get AI explanation for an exercise
router.post("/explain", auth, async (req, res) => {
  try {
    const { exerciseId, userAnswer } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ message: "Exercise ID is required" });
    }

    const db = await getDatabase();
    const exercise = await db.get("SELECT * FROM exercises WHERE id = ?", [
      exerciseId,
    ]);

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    // Generate explanation (in a real app, this would call an AI service)
    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      exercise.correct_answer.toLowerCase().trim();
    let explanation = "";

    if (isCorrect) {
      explanation = `Correct! "${userAnswer}" is the right answer. ${generateExplanation(exercise)}`;
    } else {
      explanation = `The correct answer is "${exercise.correct_answer}". ${generateExplanation(exercise)}`;
    }

    res.json({ explanation });
  } catch (error) {
    console.error("Explain exercise error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to generate explanations
function generateExplanation(exercise: any): string {
  // In a real app, this would use an AI service
  // Here we're just using some hardcoded explanations based on the exercise type

  switch (exercise.type) {
    case "translate":
      return "When translating, pay attention to word order and verb conjugation, which can differ between languages.";

    case "multiple_choice":
      return "Multiple choice questions test your recognition of vocabulary and phrases in context.";

    default:
      return "Practice makes perfect! Keep reviewing this concept to reinforce your learning.";
  }
}

export default router;
