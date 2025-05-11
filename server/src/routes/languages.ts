import express from "express";
import { getDatabase } from "../database";
import { auth } from "../middleware/auth";

const router = express.Router();

// Get all languages
router.get("/", async (req, res) => {
  try {
    const db = await getDatabase();
    const languages = await db.all("SELECT * FROM languages");
    res.json(languages);
  } catch (error) {
    console.error("Get languages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific language
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    const language = await db.get("SELECT * FROM languages WHERE id = ?", [id]);

    if (!language) {
      return res.status(404).json({ message: "Language not found" });
    }

    res.json(language);
  } catch (error) {
    console.error("Get language error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
