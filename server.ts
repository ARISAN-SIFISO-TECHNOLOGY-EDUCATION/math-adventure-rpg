import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/generate-math", async (req, res) => {
    try {
      const { level = 1, phase = 1, topic = '' } = req.body;
      const apiKey = process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ error: "ANTHROPIC_API_KEY is not set in the environment variables." });
      }

      const anthropic = new Anthropic({ apiKey });

      const ageContext: Record<number, string> = {
        1: "pre-school children aged 3–5. Use extremely simple language. All numbers must be 10 or less. Use counting scenarios with animals, toys, or food. No abstract symbols.",
        2: "lower primary children aged 6–8. Use friendly simple language. Numbers up to 100. Include fun scenarios with monsters, sweets, or toys.",
        3: "higher primary children aged 9–10. Can use standard math notation. Numbers up to 1000. Use relatable word problems.",
        4: "advanced primary children aged 11–12. Include fractions, decimals, and percentages. Expect solid arithmetic knowledge.",
      };

      const prompt = `Generate a fun, kid-friendly math question about: ${topic || "basic arithmetic"}.
This is for ${ageContext[phase] || ageContext[1]}
This is level ${level} of 5 within the current phase.

Return ONLY a raw JSON object — no markdown, no explanation:
{
  "question": "Question text — keep it fun and thematic (use monsters, aliens, sweets, space, animals)",
  "options": [option1, option2, option3, option4],
  "correctAnswer": theCorrectAnswer
}

Rules:
- options must have exactly 4 items; exactly one must equal correctAnswer
- Wrong options should be plausible but clearly distinct from the correct answer
- Phase 1 (pre-school): options must be whole numbers between 1 and 10
- Keep questions short (under 20 words for phases 1–2, longer is fine for phases 3–4)`;

      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
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
        const match = jsonStr.match(/\{.*\}/s) || [jsonStr];
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
