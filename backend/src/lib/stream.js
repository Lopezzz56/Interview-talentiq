import { StreamChat} from "stream-chat"
import { StreamClient} from "@stream-io/node-sdk"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if(!apiKey || !apiSecret){
    console.error("Stream api key or Stream api secret is missing")
}


export const chatClient = StreamChat.getInstance(apiKey, apiSecret);// for chatmessaging
export const streamClient = new StreamClient(apiKey, apiSecret); //used for video calls
// stream.js
export const upsertStreamUser = async (userData) => {
    // Ensure client is ready
    const client = StreamChat.getInstance(apiKey, apiSecret); 
    try {
        const response = await client.upsertUser(userData);
        console.log("Stream response:", response); // Log the actual response
        return response;
    } catch (error) {
        console.error("Stream API Error:", error.message, error.stack);
        throw error; // Rethrow so Inngest knows to retry
    }
};

export const deleteStreamUser = async (userId) => {
    try{
await chatClient.deleteUser(userId)
console.log("Stream user Deleted ", userId)
    }catch(error){
console.error("Error Deleting Stream user", error)
    }
    
}