import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    eventDateTime: { type: Date, required: true }, 
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true }
  });
  
  export default mongoose.model("Event", eventSchema);
