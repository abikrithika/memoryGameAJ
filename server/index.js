import express from "express";
import knex from "knex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../html")));
app.use("/scripts", express.static(path.join(__dirname, "../scripts")));
app.use("/css", express.static(path.join(__dirname, "../html/css")));
app.use("/images", express.static(path.join(__dirname, "../images")));

const db = knex({
  client: "sqlite3",
  connection: { filename: "./database.db" },
  useNullAsDefault: true,
});

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

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
