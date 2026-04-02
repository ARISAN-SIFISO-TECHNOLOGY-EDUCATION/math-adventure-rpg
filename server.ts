import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate-math", async (req, res) => {
    try {
      const { level } = req.body;
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({ error: "ANTHROPIC_API_KEY is not set in the environment variables." });
      }

      const anthropic = new Anthropic({
        apiKey: apiKey,
      });

      const prompt = `Generate a fun, kid-friendly math question suitable for level ${level || 1} (ages 6-8). 
      Return ONLY a JSON object with the following structure:
      {
        "question": "The text of the question (e.g., 'If 3 alien monsters join 4 other alien monsters, how many are there?')",
        "options": [7, 5, 8, 12], // Array of 4 numbers or short strings. One must be correct.
        "correctAnswer": 7 // The correct answer from the options array
      }`;

      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        temperature: 0.7,
        system: "You are a fun, encouraging math teacher for young kids. Always output valid JSON.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = msg.content[0];
      if (content.type === 'text') {
        const jsonStr = content.text.trim();
        // Extract JSON if it's wrapped in markdown
        const match = jsonStr.match(/\\{.*\\}/s) || [jsonStr];
        const parsed = JSON.parse(match[0]);
        res.json(parsed);
      } else {
        throw new Error("Unexpected response type from Claude");
      }
    } catch (error: any) {
      console.error("Error generating math question:", error);
      res.status(500).json({ error: error.message || "Failed to generate question" });
    }
  });

  // Vite middleware for development
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
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer();
