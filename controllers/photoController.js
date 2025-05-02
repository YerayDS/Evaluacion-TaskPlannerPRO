import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

export const uploadPhoto = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se subió ninguna foto." });
    }
    res.status(200).json({ file: req.file.filename });
};

export const getPhotos = (req, res) => {
    const files = fs.readdirSync(uploadsDir);
    res.json(files);
};

export const deletePhoto = (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: "Foto eliminada." });
    } else {
        res.status(404).json({ message: "Archivo no encontrado." });
    }
};