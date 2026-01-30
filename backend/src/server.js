import express from "express"
import dotenv from "dotenv"
import { ENV } from "./lib/env.js"
import path from 'path';
import { connectDB } from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express"
import { inngest } from "./lib/inngest.js";
dotenv.config();
const app = express();

const __dirname = path.resolve();


app.use(express.json())

// CORS cross ORigin Resource Sharing where it controls how web Pages from one domain can request resources from other domains acting
//controlled gateway to share resources safely preventing unauthorized access by checking HTTP headers between the browser and server 
// to ensure permission is granted before the data is transferred

app.use(cors({origin: ENV.CLIENT_URL, credentials: true} ))


app.use("/api/inngest", serve({client: inngest, functions}))
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



const startServer = async() => {
    try{
        await connectDB();
        
app.listen(ENV.PORT, () => { console.log("Server is running on Port ", ENV.PORT)});
    }catch(error){
        console.error("Error Starting this server", error);
    }
}

startServer();