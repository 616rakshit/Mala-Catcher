/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Terapanth Spiritual Companion Prompt
const SYSTEM_INSTRUCTION = `
You are a peaceful, wise, and compassionate Terapanth Jain Spiritual Companion, styled after the teachings of Acharya Bhikshu (the founder of Terapanth Shvetambara Jainism) and standard Jain philosophy.
Your goal is to guide the user (Sadhaka) on their spiritual path of mindfulness, Ahimsa (non-violence), Tapasya (restraint), Samayik (meditation), and Mala Jaap (rosary chanting).

Guidelines for your personality and content:
1. Always be gentle, calm, encouraging, and deeply respectful. Use serene, elegant language.
2. Share wisdom regarding:
   - Acharya Bhikshu: His revolutionary focus on inner purity of soul (Shuddha Dharma), discipline, white robes, and organizing the Terapanth order.
   - The Navkar Mantra: The supreme mantra of five fold salutations.
   - Ahimsa & Karuna (compassion): Extending absolute non-injury with thoughts, speech, and deeds to all living beings.
   - Samayik & Dhyana: The practice of equanimity (Samatva) for 48 minutes.
   - Spiritual virtues: Truth (Satya), Non-stealing (Achaurya), Bramhacharya, and Aparigraha (Non-possessiveness).
3. Do not assume or assert extreme rigid rules, but convey the supreme beauty of Jain self-purification with humility.
4. Keep the output relatively concise (around 100-250 words) so it fits nicely in the Sadhana chat widget.
5. Do not use verbose technical jargon or computer-code listings. Use warm, uplifting formatting.
`;

// API endpoint: Ask spiritual queries or chat with AI Guru
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    // Map history to the format expected by the @google/genai SDK
    // Format: Array of contents or chats
    const formattedContents: any[] = [];

    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        formattedContents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append the active message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const outputText = response.text || "I apologize, but I am in silent meditation. Let us focus our mind on the sacred chants of Acharya Bhikshu.";
    res.json({ text: outputText });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    res.status(500).json({
      error: "Could not connect to the spiritual guide. " + (error.message || ""),
      fallback: "The path of self-realization requires steady patience. Breathe deeply and chant 'Om Bhikshu' inside your heart."
    });
  }
});

// API endpoint: Generate spiritual Daily Quote or Blessing
app.post("/api/quote", async (req, res) => {
  try {
    const { name, goal } = req.body;
    const ai = getGeminiClient();

    const prompt = `
Generate a soul-touching, inspirational Daily Blessing and brief Spiritual Quote of the Day.
${name ? `Address it to Sadhaka: ${name}.` : ""}
${goal ? `Theme it around: ${goal} (such as Mindfulness, Kindness, Calmness, Ahimsa, or Rosary Chanting).` : "Theme it around general spiritual purification and Acharya Bhikshu's tenets."}
Keep it short, peaceful, and formatting-clean (2-3 sentences max). Use poetic but humble language.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a spiritual master of Terapanth Jainism who shares concise daily blessings and quotes.",
        temperature: 0.8,
      },
    });

    const outputText = response.text || "May your soul shine with the light of eternal purity. Have patience, step forward.";
    res.json({ quote: outputText });
  } catch (error) {
    console.error("Gemini API Error in /api/quote:", error);
    // Return high-quality spiritual fallbacks to keep the app 100% beautiful even without an API key
    const fallbacks = [
      "Pure spirit is characterized by peaceful silence. Let go of outer attachments and realize the infinite beauty of your inner self.",
      "Ahimsa is the highest truth. Let every breath breathe out compassion to all creatures in the cosmos.",
      "Just as the sun melts away darkness, pure contemplation removes the dust of past karmas from the divine canvas of your soul.",
      "Control your mind before it controls you. In the garden of meditation, equanimity is the sweet nectar.",
      "Acharya Bhikshu says: 'Shuddha Dharma' resides in pure intentions, not outward show. Seek the truth within."
    ];
    const chosenFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ quote: chosenFallback });
  }
});

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mala Catcher backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
