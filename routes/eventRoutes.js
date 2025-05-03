import express from "express";
import Event from "../models/eventModel.js";

const router = express.Router();

// Obtener todos los eventos
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDateTime: 1 });
    res.json(events);
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    res.status(500).json({ message: "Error al obtener eventos" });
  }
});

// Obtener un evento específico
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Evento no encontrado" });
    res.json(event);
  } catch (err) {
    console.error("Error al obtener evento:", err);
    res.status(500).json({ message: "Error al obtener evento" });
  }
});

// Crear nuevo evento
router.post("/", async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, eventDateTime } = req.body;

    const newEvent = new Event({
      title,
      description,
      eventDate,
      eventTime,
      eventDateTime,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("Error al crear evento:", err);
    res.status(500).json({ message: "Error al crear evento" });
  }
});

// Actualizar un evento
router.put("/:id", async (req, res) => {
  try {
    const { title, description, eventDate, eventTime, eventDateTime } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, eventDate, eventTime, eventDateTime },
      { new: true }
    );

    if (!updatedEvent) return res.status(404).json({ message: "Evento no encontrado" });

    res.json(updatedEvent);
  } catch (err) {
    console.error("Error al actualizar evento:", err);
    res.status(500).json({ message: "Error al actualizar evento" });
  }
});

// Eliminar un evento
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ message: "Evento no encontrado" });

    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar evento:", err);
    res.status(500).json({ message: "Error al eliminar evento" });
  }
});

export default router;
