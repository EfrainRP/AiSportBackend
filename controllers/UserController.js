import bcrypt from "bcrypt";
import { prisma } from '../prisma/db.js';

// Mostrar todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();  // `findMany()` en lugar de `query.getAllUsers()`
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mostrar un usuario por ID
export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.id, 10)  // Convierte el `id` a número entero
      }
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
  const { id, email, password } = req.body;
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await prisma.user.update({
      where: {
        id: parseInt(id, 10)  // Convierte el `id` a número entero
      },
      data: {
        email,
        password: hashedPassword,  // Actualiza solo si se proporciona
      },
    });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const { id } = req.body;
  try {
    await prisma.user.delete({
      where: {
        id: parseInt(id, 10)  // Convierte el `id` a número entero
      },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.users.findUnique({ // Uso del modelo "users" en schema.prisma  
      where: {
        email
      }
    });
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Devuelve el nombre de usuario además del mensaje
      res.json({ 
        message: 'Login successful', 
        username: user.name 
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Registro de usuario
export const registerUser = async (req, res) => {
  const { name, fsurname, msurname, nickname, email, gender, password, birthdate } = req.body;

  // Validar si faltan campos
  if (!name || !fsurname || !msurname || !nickname || !email || !password || !birthdate) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Validar tipos y formatos
  const errors = [];

  if (typeof name !== 'string' || name.length > 60) {
    errors.push('El nombre debe ser una cadena de hasta 60 caracteres.');
  }

  if (typeof fsurname !== 'string' || fsurname.length > 50) {
    errors.push('El primer apellido debe ser una cadena de hasta 50 caracteres.');
  }

  if (typeof msurname !== 'string' || msurname.length > 50) {
    errors.push('El segundo apellido debe ser una cadena de hasta 50 caracteres.');
  }

  if (nickname && (typeof nickname !== 'string' || nickname.length > 50)) {
    errors.push('El apodo debe ser una cadena de hasta 50 caracteres.');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('El correo electrónico no es válido.');
  }

  if (gender && typeof gender !== 'string') {
    errors.push('El género debe ser una cadena.');
  }

  if (typeof password !== 'string' || password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres.');
  }

  // Validar fecha de nacimiento
  const birthDateObj = new Date(birthdate);
  if (isNaN(birthDateObj.getTime())) {
    errors.push('La fecha de nacimiento no es válida.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Errores de validación', errors });
  }

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // Crear un nuevo usuario en la base de datos
    const user = await prisma.users.create({ // Uso del modelo "users" en schema.prisma <-
      data: {
        name,
        fsurname,
        msurname,
        nickname,
        email,
        gender: gender || 'N/E', // Asignar 'N/E' si el género no se especifica
        password: hashedPassword,
        birthdate: birthDateObj, // Fecha como un objeto Date
      },
    });
    // Responder con el usuario creado
    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    console.error('Error registrando usuario:', error);  // Para depuración
    res.status(500).json({ message: 'Error registrando usuario', error });
  }
};
