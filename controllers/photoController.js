import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, "secret_key");
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Acceso denegado. Solo administradores pueden eliminar fotos." });
        }

        const filePath = path.join(uploadsDir, req.params.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ message: "Foto eliminada." });
        } else {
            res.status(404).json({ message: "Archivo no encontrado." });
        }
    } catch (err) {
        res.status(401).json({ message: "Token inválido." });
    }
};
