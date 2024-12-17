import express from 'express';
import * as UserController from '../controllers/UserController.js';
import * as TorneosController from '../controllers/TorneosController.js';
import * as EquiposController from '../controllers/EquiposController.js';
import * as PartidosController from '../controllers/PartidosController.js';
import * as TorneoEquiposController from '../controllers/TorneoEquiposController.js';
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

//Ruta Dashboard
router.get('/dash/:id', DashboardController.dashIndex);
// Rutas de TORNEOS (CRUD)
router.get('/torneos/:id', TorneosController.index);
router.get('/torneo/:torneoName/:torneoId', TorneosController.show); 
router.put('/torneo/:torneoId', TorneosController.update);
router.delete('/torneo/:torneoId', TorneosController.eliminate); 
router.post('/torneo/create', TorneosController.store); 
// Rutas en Relacion (TORNEO_EQUIPOS)
router.get('/equipos/torneo/:id', TorneoEquiposController.index); //Todos los equipos de un Torneo <-
//router.post('/equipos/torneo/create/:torneoId/:equipoId', TorneoEquiposController.store); //Añade equipo a un torneo
//router.delete('/equipos/torneo/delete/:torneoId/:equipoId', TorneoEquiposController.eliminate); //Elimina equipo de un torneo
//router.get('/equipos/torneo/lista/:torneoId', TorneoEquiposController.index); //Equipos de un torneo
// Rutas de EQUIPOS (CRUD)
router.get('/equipos/:id', EquiposController.index);
router.get('/equipo/:equipoName/:equipoId', EquiposController.show); 
router.put('/equipo/:equipoId', EquiposController.update); 
router.delete('/equipo/:equipoId', EquiposController.eliminate);  
router.post('/equipo/create', EquiposController.store); 
// Rutas de PARTIDOS (CRUD)
router.get('/partidos/:torneoId', PartidosController.index);
router.get('/partido/:torneoId/:partidoId', PartidosController.show);
//router.put('/partido/:torneoId/:partidoId', PartidosController.update); 
router.delete('/partido/:torneoId/:partidoId', PartidosController.eliminate); 
router.post('/partido/create/:torneoId', PartidosController.store); 


export default router;