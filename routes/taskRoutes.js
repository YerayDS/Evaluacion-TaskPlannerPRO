import express from "express";
import Task from "../models/taskModel.js";

const router = express.Router();

// Obtener todas las tareas o filtrar por estado
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    let tasks;
    if (status) {
      tasks = await Task.find({ status });
      console.log(`Tareas con estado "${status}" obtenidas: `, tasks);
    } else {
      tasks = await Task.find();
      console.log("Todas las tareas obtenidas: ", tasks);
    }

    res.json(tasks);
  } catch (err) {
    console.error("Error al obtener tareas: ", err);
    res.status(500).json({ message: "Error al obtener las tareas" });
  }
});

// Crear una nueva tarea
router.post("/", async (req, res) => {
  try {
    const { title, description, date, status } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Título y fecha son requeridos" });
    }

    const newTask = new Task({
      title,
      description,
      date,
      status,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Error al crear la tarea" });
  }
});

// Obtener una tarea por ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener la tarea" });
  }
});

// Actualizar una tarea
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
});

// Eliminar una tarea
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea eliminada" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar la tarea" });
  }
});

export default router;
