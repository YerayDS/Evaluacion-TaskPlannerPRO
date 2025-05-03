import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true }, 
    status: {
      type: String,
      enum: ["pending", "inprogress", "completed"],
      default: "pending"
    }
  });
  

export default mongoose.model("Task", taskSchema);
