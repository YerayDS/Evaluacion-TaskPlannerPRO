import express from "express";
import Task from "../models/taskModel.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const tasks = status ? await Task.find({ status }) : await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener las tareas" });
  }
});

router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, date, status } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: "Título y fecha son requeridos" });
    }

    const newTask = new Task({ title, description, date, status });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Error al crear la tarea" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener la tarea" });
  }
});

router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) return res.status(404).json({ message: "Tarea no encontrada" });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
});

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Tarea no encontrada" });
    res.json({ message: "Tarea eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar la tarea" });
  }
});

export default router;
