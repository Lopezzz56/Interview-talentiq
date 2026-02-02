import { StreamChat} from "stream-chat"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if(!apiKey || !apiSecret){
    console.error("Stream api key or Stream api secret is missing")
}


export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData) => {
    try{
console.log("Upserting to Stream...");

await chatClient.upsertUser(userData)
console.log("Stream user Upserted Successfully", userData)
    }catch(error){
console.error("Error Upserting Stream user", error)
    }

}

export const deleteStreamUser = async(userId) => {
    try{
await chatClient.deleteUser(userId)
console.log("Stream user Deleted ", userId)
    }catch(error){
console.error("Error Deleting Stream user", error)
    }
    
}