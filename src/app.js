import express from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "./lib/auth.js";

const app = express();
const port = 8080;

// Enable CORS before any route
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // required for cookies/sessions
}));


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
// Optional: catch-all for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
