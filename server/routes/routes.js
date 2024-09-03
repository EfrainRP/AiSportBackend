import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/UserController.js';

const router = express.Router();

//Rutas de Usuarios
router.get('/',getAllUsers);
router.get('/:id',getUser);
router.post('/',createUser);
router.put('/:id',updateUser);
router.delete('/:id',deleteUser);

export default router;