import express from "express";
import knex from "knex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve frontend and assets
app.use(express.static(path.join(__dirname, "../html"))); // index.html
app.use("/scripts", express.static(path.join(__dirname, "../scripts"))); // script.js
app.use("/css", express.static(path.join(__dirname, "../html/css"))); // styles.css
app.use("/images", express.static(path.join(__dirname, "../images"))); // images

// Database setup
const db = knex({
  client: "sqlite3",
  connection: { filename: "./database.db" },
  useNullAsDefault: true,
});

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
    const scores = await db("score")
      .select("*")
      .orderBy("time", "asc")
      .orderBy("reveals", "asc")
      .limit(10);
    response.json(scores);
  } catch (error) {
    console.error("Scores endpoint error:", error);
    response.status(500).json({ error: "Failed to retrieve scores" });
  }
});

// POST endpoint for saving a new score
app.post("/scores", async function (request, response) {
  try {
    const { name, time, reveals } = request.body;

    // Validate input
    if (!name || time === undefined || reveals === undefined) {
      return response.status(400).json({ error: "Missing required fields" });
    }

    // Insert new score
    await db("score").insert({
      name,
      time,
      reveals,
    });

    // Retrieve top 10 scores
    const topScores = await db("score")
      .select("*")
      .orderBy("time", "asc")
      .orderBy("reveals", "asc")
      .limit(10);

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
