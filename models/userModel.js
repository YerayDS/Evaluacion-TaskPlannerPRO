// userModel.js
const users = []; // Esta será tu "base de datos" temporalmente, en producción usa una base de datos real

// Modelo de usuario (en producción usa una base de datos como MongoDB)
const User = {
    // Buscar un usuario por email
    findOne: (email) => users.find(user => user.email === email),
    
    // Crear un nuevo usuario
    create: (userData) => {
        users.push(userData);
        return userData;
    },
};

export default User;
