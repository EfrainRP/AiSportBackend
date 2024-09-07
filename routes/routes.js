import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/UserController.js';
import { dashIndex } from '../controllers/DashboardController.js';

const router = express.Router();

//Rutas de USUARIOS
router.get('/',getAllUsers);
router.get('/:id',getUser);
// router.post('/',createUser);
// router.put('/:id',updateUser);
// router.delete('/:id',deleteUser);

//Rutas de TORNEOS
router.get('/dash/:id',dashIndex);

export default router;