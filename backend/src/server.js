import express from "express"
import dotenv from "dotenv"
import { ENV } from "./lib/env.js"
dotenv.config();
const app = express();

console.log(ENV.PORT);
app.get("/health", (req, res) => {
    res.status(200).json({msg:"success from api"})
})

app.listen(3000, () => console.log("Server is running on Port ", ENV.PORT))