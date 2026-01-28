import express from "express"
import dotenv from "dotenv"
import { ENV } from "./lib/env.js"
import path from 'path';

dotenv.config();
const app = express();

const __dirname = path.resolve();

console.log(ENV.PORT);
app.get("/health", (req, res) => {
    res.status(200).json({msg:"success from api"})
})
app.get("/books", (req, res) => {
    res.status(200).json({msg:"this is the books endpoint"})
})

if(ENV.NODE_ENV == "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    } )
}

app.listen(3000, () => console.log("Server is running on Port ", ENV.PORT))