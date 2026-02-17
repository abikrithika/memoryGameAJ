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


app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
