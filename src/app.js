import receiptRoutes from "./routes/receipt.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import moveRoutes from "./routes/moveHistory.routes.js";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "./lib/auth.js";

const app = express();
const port = 8080;

// Enable CORS before any route
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // required for cookies/sessions
}));


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
// Optional: catch-all for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});



app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/movements", moveRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
