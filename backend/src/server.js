import express from "express"
import dotenv from "dotenv"
import { ENV } from "./lib/env.js"
import path from 'path';
import { connectDB } from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express"
import { inngest, functions} from "./lib/inngest.js";
import { clerkMiddleware } from '@clerk/express'
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // adds adds Auth field to request object req.auth()

// Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.get("/api/chat", chatRoutes);
app.get("/api/sessions", sessionRoutes);

//When you pass array of middleware to expres it automaticlaly flatterns and executes them sequentially onebyone
app.get("/video-calls", protectRoute, (req, res) => res.status(200).json({ msg: "Video Call ended" }));


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