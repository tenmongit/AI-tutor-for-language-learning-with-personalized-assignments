import express from "express";
import fetch from "node-fetch";
import { auth } from "../middleware/auth";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Chat with AI endpoint
router.post("/", auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Prepare prompt for language learning context
    const prompt = `You are a helpful language tutor. The user is learning a new language. ${message}`;

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
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true
          }
        }),
      }
    );

    const data = await hfResponse.json();
    
    // Extract response from Hugging Face API
    let reply = "";
    if (data.error) {
      console.error("Hugging Face API error:", data.error);
      reply = "I'm having trouble connecting to my language model right now. Please try again later.";
    } else {
      // Different models return different response formats
      reply = Array.isArray(data) 
        ? data[0]?.generated_text 
        : data.generated_text || "I'm not sure how to respond to that.";
        
      // Clean up the response if it contains the prompt
      if (reply.includes(prompt)) {
        reply = reply.substring(prompt.length).trim();
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ 
      message: "Server error", 
      reply: "I'm having trouble processing your request right now. Please try again later." 
    });
  }
});

export default router;
