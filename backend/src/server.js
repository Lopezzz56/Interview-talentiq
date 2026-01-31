import express from "express"
import dotenv from "dotenv"
import { ENV } from "./lib/env.js"
import path from 'path';
import { connectDB } from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express"
import { inngest } from "./lib/inngest.js";
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

// Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.get("/health", (req, res) => res.status(200).json({ msg: "success" }));

// 🟢 REMOVE: if(ENV.NODE_ENV == "production") static serving
// Vercel handles static files via the "rewrites" in vercel.json much better.

// 🟢 WRAP THE STARTUP LOGIC
const connect = async () => {
    await connectDB();
};
connect();

// 🟢 EXPORT THE APP (This is what Vercel needs)
export default app;

// 🟢 CONDITIONAL LISTEN (Only for local development)
if (process.env.NODE_ENV !== "production") {
    app.listen(ENV.PORT, () => console.log("Local server on port", ENV.PORT));
}