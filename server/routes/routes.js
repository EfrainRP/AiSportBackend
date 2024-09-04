import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/UserController.js';
import { dashIndex } from '../controllers/DashboardController.js';
const router = express.Router();

//Rutas de Usuarios
router.get('/',getAllUsers);
router.get('/:id',dashIndex);
router.post('/',createUser);
router.put('/:id',updateUser);
router.delete('/:id',deleteUser);

export default router;