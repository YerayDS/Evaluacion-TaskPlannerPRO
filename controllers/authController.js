import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';  
import { sendWelcomeEmail } from '../mailer.js';  

// Función de registro
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = User.findOne(email);  
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = { email, password: hashedPassword };
        User.create(newUser); 

        await sendWelcomeEmail(email); 

        const token = jwt.sign({ email }, 'secret_key', { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario creado y correo de bienvenida enviado', token });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = User.findOne(email);  
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ email }, 'secret_key', { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login exitoso', token });
    } catch (error) {
        console.error('Error al hacer login:', error);  
        return res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};
