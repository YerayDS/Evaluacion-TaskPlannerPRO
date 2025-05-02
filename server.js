import express from 'express';
import path from 'path';
import multer from 'multer';
import { uploadPhoto, getPhotos, deletePhoto } from './controllers/photoController.js'; 
import { fileURLToPath } from 'url';

const app = express();
const port = 5500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname)));  

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  
});

app.post('/api/photos', upload.single('photo'), uploadPhoto);  
app.get('/api/photos', getPhotos); 
app.delete('/api/photos/:filename', deletePhoto);  

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
