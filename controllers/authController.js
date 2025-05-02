import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';

// Función de registro
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar si ya existe un usuario con el mismo email
        const existingUser = User.findOne(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const newUser = { email, password: hashedPassword };
        User.create(newUser);

        // Generar JWT
        const token = jwt.sign({ email }, 'secret_key', { expiresIn: '1h' });

        // Enviar respuesta
        res.status(201).json({ message: 'Usuario creado', token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

// Función de login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar usuario
        const user = User.findOne(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar JWT
        const token = jwt.sign({ email }, 'secret_key', { expiresIn: '1h' });

        // Enviar respuesta
        res.status(200).json({ message: 'Login exitoso', token });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};