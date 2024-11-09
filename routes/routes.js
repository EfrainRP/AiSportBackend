import express from 'express';
import * as UserController from '../controllers/UserController.js';
import * as DashboardController from '../controllers/DashboardController.js';

const router = express.Router();

//Rutas de USUARIOS
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUser);
router.post('/login', UserController.loginUser); // Ruta para el inicio de sesión

// Ruta de registro
router.post('/register', UserController.registerUser);

// router.post('/', UserController.createUser);
// router.put('/:id', UserController.updateUser);
// router.delete('/:id', UserController.deleteUser);

//Rutas de TORNEOS
router.get('/dash/:id', DashboardController.dashIndex);

export default router;