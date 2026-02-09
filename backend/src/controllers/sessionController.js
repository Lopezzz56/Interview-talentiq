import { StreamClient } from "@stream-io/node-sdk"
import { chatClient, streamClient } from "../lib/stream.js"
import Session from "../models/Session.js"

export async function createSession(req, res){
try {
    const { problem, difficulty } = req.body
    const userId = req.user._id
    const clerkId = req.user.clerkId
    if(!problem || !difficulty){
        return res.status(400).json({message: "Problem and Difficulty required"})
    }
    //generate unique call id for stream video

    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const session = await Session.create(
        {problem, difficulty, host:userId, callId})

    await streamClient.video.call("default", callId).getOrCreate({
        data:{
            created_by_id:clerkId,
            custom: {
                problem, difficulty,session:session._id.toString()}
        }
    });

    //chat messaging
    const channel = chatClient.channel("messaging", callId, {
        name:`${problem} Session`,
        created_by_id: clerkId,
        members: [clerkId]
    })

    await channel.create()

    res.status(201).json({session})
} catch (error) {
    console.log("Error in createSession controller", error.message);
    res.status(500).json({message: "Internal Server Error"})
}
}

export async function getActiveSessions(req, res){
    try {
            const sessions = (await Session.find({status:"active"}).populate("host", "name profileImage email clerkId")).toSorted({createdAt:-1}).limit(20);

            res.status(200).json({sessions})


    } catch (error) {
    console.log("Error in getActiveSessions controller", error.message);
    res.status(500).json({message: "Internal Server Error"})
    }

}

export async function getMyRecentSessions(req, res){
    try {
        const userId = req.user._id
        //where user is host or participant
        const sessions = await Session.find(
            {status: "completed",
                $or: [{host:userId}, {participant:userId}]
            }).sort({createdAt:-1})
            .limit(20);

            res.status(200).json({sessions})
    } catch (error) {
    console.log("Error in getMyRecentSessions controller", error.message);
    res.status(500).json({message: "Internal Server Error"})       
    }
}

export async function getSessionById(req, res){
    try {
        const {id} = req.params

        const session = await Session.findById(id)
        .populate("host", "name email profileImage clerkId")
        .populate("participant", "name email profileImage clerkId" )

        if(!session) return res.status(400).json({message: "Session not Found"})

        res.status(200).json({sessions})
    } catch (error) {
    console.log("Error in getSessionById controller", error.message);
    res.status(500).json({message: "Internal Server Error"})    
    }
}

export async function joinSession(req, res){
    try {
        const {id} = req.params
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id)


        //check if session is full max participants 2
        if(!session) return res.status(400).json({message: "Session not Found"})
        if(session.participant) return res.status(409).json({message: "Session is Full"})

        session.participant = userId

        await session.save()

         const channel = chatClient.channel("messaging", session.callId)
         await channel.addMembers([clerkId])

         res.status(200).json({session})
    } catch (error) {
    console.log("Error in joinSession controller", error.message);
    res.status(500).json({message: "Internal Server Error"})           
    }
}

export async function endSession(req, res){
    try {
        const {id} = req.params

        const userId = req.user._id

        const session = await Session.findById(id)

        if(!session) return res.status(400).json({message: "Session not Found"})

//check if user is host

if(session.host.toString() != userId.toString()){
    return res.status(403).json({message: "Only the host can end the session"})
}

//check if session is already completed
if(session.status === "completed"){
    return res.status(400).json({message: "Session Already completed"})
}

//delete Stream
const call = StreamClient.video.call("default", session.callId)
await call.delete({hard:true})
//delete CHat
const channel = chatClient.channel("messaging", session.callId)
await channel.delete();
session.status = "completed"
await session.save()
res.status(200).json({session, message: "Session Ended Successfully"})
    } catch (error) {
    console.log("Error in endSession controller", error.message);
    res.status(500).json({message: "Internal Server Error"})   
    }
}