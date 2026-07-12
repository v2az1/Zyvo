import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API routes
app.post("/api/summarize", async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject && !body) {
      return res.status(400).json({ error: "Subject or body is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets."
      });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Please summarize the following email.
Subject: ${subject}
Body:
${body}`,
      config: {
        systemInstruction: "You are an expert email summarization assistant. Analyze the email and produce exactly 3 to 5 concise, actionable bullet points summarizing key information, important dates, action items, OTPs, links, and deadlines. Keep bullet points brief, high-impact, and professional.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 concise bullet points summarizing the email."
            }
          },
          required: ["bulletPoints"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text);
    res.json({ bulletPoints: data.bulletPoints });
  } catch (err: any) {
    console.error("Gemini summarization failed:", err);
    res.status(500).json({ error: err.message || "Failed to generate email summary." });
  }
});

// Vite middleware for development or serving build assets in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start Vite/Express server:", err);
});
