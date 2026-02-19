import express from "express";
import knex from "knex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.join(__dirname, "../app");
const imagesDir = path.join(__dirname, "../images");

const app = express();
app.use(express.json());

// Serve frontend and assets
app.use(express.static(appDir)); // index.html, script.js, styles.css
app.use("/images", express.static(imagesDir)); // images

// Database setup
const db = knex({
  client: "sqlite3",
  connection: { filename: "./database.db" },
  useNullAsDefault: true,
});

const LEADERBOARD_SIZE = 10;
const ALLOWED_LEVELS = new Set(["easy", "medium", "hard"]);

function normalizeLevel(value) {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  return ALLOWED_LEVELS.has(normalized) ? normalized : null;
}

// Helper function to get top 10 scores
async function getTopScores(level) {
  return await db("score")
    .select("*")
    .modify((queryBuilder) => {
      if (level) {
        queryBuilder.where({ level });
      }
    })
    .orderBy("time", "asc")
    .orderBy("reveals", "asc")
    .limit(LEADERBOARD_SIZE);
}

// API endpoints
app.get("/api/cards", async (req, res) => {
  try {
    const rows = await db("card").select("*");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/config/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const rows = await db("config").select("value").where({ key });
    const value = rows.length > 0 ? rows[0].value : "cardFront.jpg";
    res.json({ value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error", value: "cardFront.jpg" });
  }
});

// GET endpoint for retrieving all scores (top 10)
app.get("/scores", async function (request, response) {
  try {
    const level = normalizeLevel(request.query.level);
    if (request.query.level && !level) {
      return response.status(400).json({ error: "Invalid level" });
    }

    const scores = await getTopScores(level);
    response.json(scores);
  } catch (error) {
    console.error("Scores endpoint error:", error);
    response.status(500).json({ error: "Failed to retrieve scores" });
  }
});

// POST endpoint for saving a new score
app.post("/scores", async function (request, response) {
  try {
    const { name, time, reveals, level } = request.body;
    const normalizedLevel = normalizeLevel(level);

    // Validate input
    if (
      !name ||
      time === undefined ||
      reveals === undefined ||
      !normalizedLevel
    ) {
      return response.status(400).json({ error: "Missing required fields" });
    }

    // Insert new score
    await db("score").insert({
      name,
      time,
      reveals,
      level: normalizedLevel,
    });

    // Get top 10 scores
    const topScores = await getTopScores(normalizedLevel);

    // Delete scores beyond top 10 to prevent database bloat
    if (topScores.length === LEADERBOARD_SIZE) {
      const worstTopScore = topScores[LEADERBOARD_SIZE - 1];
      await db("score")
        .where({ level: normalizedLevel })
        .andWhere(function () {
          this.where("time", ">", worstTopScore.time).orWhere(function () {
            this.where("time", "=", worstTopScore.time).andWhere(
              "reveals",
              ">",
              worstTopScore.reveals,
            );
          });
        })
        .delete();
    }

    response.status(201).json(topScores);
  } catch (error) {
    console.error("Save score endpoint error:", error);
    response.status(500).json({ error: "Failed to save score" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
