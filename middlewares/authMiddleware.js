import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; 

    if (!token) {
        return res.redirect('/auth.html'); 
    }

    try {
        const decoded = jwt.verify(token, 'secret_key');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.redirect('/auth.html'); 
    }
};
