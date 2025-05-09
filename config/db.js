import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/taskplanner", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (err) {
    console.error("Error al conectar con MongoDB:", err.message);
    process.exit(1); 
  }
};

export default connectDB;