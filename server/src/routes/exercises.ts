import express from "express";
import { getDatabase } from "../database";
import { auth } from "../middleware/auth";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

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
      correctAnswer: exercise.correct_answer || '',
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

    // Ensure correctAnswer is returned
    res.json({
      ...exercise,
      correctAnswer: exercise.correct_answer || ''
    });
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

// AI-powered explanation endpoint
router.post("/explain", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { exerciseId, userAnswer } = req.body;
    
    if (!exerciseId || userAnswer === undefined) {
      return res.status(400).json({ message: "Exercise ID and user answer are required" });
    }

    // Get exercise details
    const db = await getDatabase();
    const exercise = await db.get("SELECT * FROM exercises WHERE id = ?", [exerciseId]);
    
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    // Prepare prompt for explanation
    const prompt = `You are a language tutor. Explain why "${userAnswer}" is correct or incorrect for the question "${exercise.question}". The correct answer is "${exercise.correct_answer}". Provide a clear, concise explanation that helps the student understand the concept.`;

    // Call Hugging Face API
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY || "hf_dummy_key"}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true
          }
        }),
      }
    );

    const data = await hfResponse.json();
    
    // Extract explanation from Hugging Face API
    let explanation = "";
    if (data.error) {
      console.error("Hugging Face API error:", data.error);
      explanation = "I'm sorry, I can't provide an explanation right now. Please try again later.";
    } else {
      // Different models return different response formats
      explanation = Array.isArray(data) 
        ? data[0]?.generated_text 
        : data.generated_text || "No explanation available.";
        
      // Clean up the response if it contains the prompt
      if (explanation.includes(prompt)) {
        explanation = explanation.substring(prompt.length).trim();
      }
    }

    // Save the explanation to user progress (optional)
    await db.run(
      "UPDATE user_progress SET explanation = ? WHERE user_id = ? AND exercise_id = ? ORDER BY id DESC LIMIT 1",
      [explanation, req.user.id, exerciseId]
    );

    res.json({ explanation });
  } catch (error) {
    console.error("Explanation API error:", error);
    res.status(500).json({ 
      message: "Server error", 
      explanation: "Sorry, we couldn't generate an explanation at this time."
    });
  }
});

export default router;
