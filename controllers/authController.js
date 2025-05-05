import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { sendWelcomeEmail } from '../mailer.js';

export const registerUser = async (req, res) => {
    try {
        const { email, password, role = 'user' } = req.body;

        console.log("Datos recibidos en registro:", req.body);
        console.log("Rol recibido:", role);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: password, 
            role
        });

        console.log("Usuario creado:", newUser);

        await sendWelcomeEmail(email);

        const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, 'secret_key', {
            expiresIn: '1h'
        });

        res.status(201).json({
            message: 'Usuario creado y correo enviado',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};



export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Elimina espacios antes y después de la contraseña proporcionada
    const passwordProvided = password.trim();

    console.log("Intentando login con:", email, passwordProvided);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("Usuario no encontrado");
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log("Usuario encontrado:", user);

        // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
        const isMatch = await bcrypt.compare(passwordProvided, user.password);
        console.log("¿La contraseña coincide?:", isMatch);
        console.log("Contraseña proporcionada:", passwordProvided);
        console.log("Contraseña almacenada en DB:", user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, 'secret_key', {
            expiresIn: '1h'
        });

        return res.status(200).json({ message: 'Login exitoso', token });
    } catch (error) {
        console.error('Error al hacer login:', error);
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};


