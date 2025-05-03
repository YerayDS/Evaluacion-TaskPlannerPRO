import express from 'express';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import { uploadPhoto, getPhotos, deletePhoto } from './controllers/photoController.js';
import { fileURLToPath } from 'url';
import { registerUser, loginUser } from './controllers/authController.js'; 
import connectDB from "./config/db.js";
import taskRoutes from './routes/taskRoutes.js';  
import eventRoutes from './routes/eventRoutes.js';  



connectDB();

const app = express();
app.use(cors());
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

app.use(express.json());

app.use(express.static(path.join(__dirname), { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth.html')); 
});

app.use('/api/tasks', taskRoutes); 
app.use('/api/events', eventRoutes);

app.post('/api/auth/register', registerUser);  
app.post('/api/auth/login', loginUser); 

app.post('/api/photos', upload.single('photo'), uploadPhoto);
app.get('/api/photos', getPhotos);
app.delete('/api/photos/:filename', deletePhoto);

app.get('/index.html', (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];  

  if (!token) {
    return res.redirect('/');  
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');  
    req.user = decoded;
    res.sendFile(path.join(__dirname, 'index.html')); 
  } catch (error) {
    return res.redirect('/');  
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
