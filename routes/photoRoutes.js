import express from "express";
import multer from "multer";
import { uploadPhoto, getPhotos, deletePhoto } from "../controllers/photoController.js";
import { authenticateToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.get("/", getPhotos);

router.post("/", authenticateToken, isAdmin, upload.single("photo"), uploadPhoto);

router.delete("/:filename", authenticateToken, isAdmin, deletePhoto);

export default router;
