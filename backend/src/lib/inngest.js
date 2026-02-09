import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event, step }) => { // 1. Added 'step' here
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`;

    // 2. Sync to Database first
    const user = await step.run("sync-to-db", async () => {
      return await User.findOneAndUpdate(
        { clerkId: id },
        {
          clerkId: id,
          email,
          name,
          profileImage: image_url,
        },
        { upsert: true, new: true } // Use upsert for idempotency
      );
    });

    // 3. Sync to Stream
    await step.run("sync-to-stream", async () => {
      await upsertStreamUser({
        id: id.toString(),
        name,
        image: image_url
      });
    });

    // 4. Send Welcome Email last
await step.run("send-welcome-email", async () => {
  return await sendEmail(
    email,
    "Welcome!",
    `<div><h1>Welcome to Talent IQ, ${first_name}</h1></div>` // Use backticks and ${}
  );
});
  }
);


const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;

    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

export const functions = [syncUser, deleteUserFromDB];
