import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Se asume que el token se pasa como Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, 'secret_key');
        req.user = decoded; // Agregar datos del usuario a la petición
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token no válido' });
    }
};