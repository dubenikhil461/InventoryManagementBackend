import express from "express";
import receiptRoutes from "./routes/receipt.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import moveRoutes from "./routes/moveHistory.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { connectDB } from "./config/db.js";

const app = express();
const port = 8080;


await connectDB(); 


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, 
}));


app.all("/api/auth/*splat", toNodeHandler(auth));


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/receipts", receiptRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/movements", moveRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
