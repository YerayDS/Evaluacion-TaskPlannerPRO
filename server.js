import express from 'express';
import path from 'path';
import multer from 'multer';
import { uploadPhoto, getPhotos, deletePhoto } from './controllers/photoController.js';
import { fileURLToPath } from 'url';
import { registerUser, loginUser } from './controllers/authController.js'; // Importamos las funciones de autenticación
import { sendWelcomeEmail } from './mailer.js';  // Importamos la función para enviar el correo

const app = express();
const port = 5500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generar nombre único para la foto
  }
});

const upload = multer({ storage });

// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname), { index: false }));

// Redirigir la raíz (/) a auth.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth.html'));  // Sirve auth.html directamente
});

// Rutas de autenticación (login y registro)
app.post('/api/auth/register', async (req, res) => {
  try {
    // Primero se llama a la función de registro de usuario del authController
    const result = await registerUser(req, res);  // Pasamos req y res para que se maneje en registerUser
    if (result.success) {
      // Si el registro es exitoso, envíamos el correo de bienvenida
      const { email, name } = req.body;
      await sendWelcomeEmail(email, name);  // Enviar el correo de bienvenida

      return res.status(201).json({ message: 'Usuario creado y correo de bienvenida enviado', token: result.token });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

app.post('/api/auth/login', loginUser);  // Ruta para login

// API para manejar fotos
app.post('/api/photos', upload.single('photo'), uploadPhoto);
app.get('/api/photos', getPhotos);
app.delete('/api/photos/:filename', deletePhoto);

// Servir el archivo index.html (sólo si el usuario está autenticado)
app.get('/index.html', (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];  // Asumimos que el token viene como Bearer <token>

  if (!token) {
    return res.redirect('/');  // Redirige a la página de autenticación si no hay token
  }

  // Verificamos si el token es válido (puedes usar un middleware, por ejemplo)
  try {
    const decoded = jwt.verify(token, 'secret_key');  // Cambia 'secret_key' por la que uses en tu aplicación
    req.user = decoded;
    res.sendFile(path.join(__dirname, 'index.html'));  // Sirve index.html si el token es válido
  } catch (error) {
    return res.redirect('/');  // Redirige a la página de autenticación si el token es inválido
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
