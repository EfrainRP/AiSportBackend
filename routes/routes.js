import express from 'express';
import { upload, handleMulterError } from '../utils/multer.js';
import * as UserController from '../controllers/UserController.js';
import * as TorneosController from '../controllers/TorneosController.js';
import * as EquiposController from '../controllers/EquiposController.js';
import * as PartidosController from '../controllers/PartidosController.js';
import * as TorneoEquiposController from '../controllers/TorneoEquiposController.js';
import * as DashboardController from '../controllers/DashboardController.js';
import * as ProfileController from '../controllers/ProfileController.js';
import * as NotificationController from '../controllers/NotificationController.js';
import * as EstadisticasController from '../controllers/EstadisticasController.js';
import * as IAController from '../controllers/IAController.js';
import * as EmailController from '../controllers/EmailController.js'; // Email Service <-

const router = express.Router();
// Email Routes
router.get('/send-email/:userId',EmailController.emailSend);
router.put('/restore-password/:userId',EmailController.passwordRestore);
//Rutas de USUARIOS
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUser);
router.post('/login', UserController.loginUser); // Ruta para el inicio de sesión

// Ruta de registro
router.post('/register', UserController.registerUser);

// router.post('/', UserController.createUser);
// router.put('/:id', UserController.updateUser);
// router.delete('/:id', UserController.deleteUser);

//Rutas del DASHBOARD
router.get('/dashboard/:userId', DashboardController.index);
//router.get('/dash/:id', DashboardController.dashIndex);

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
router.put('/equipo/:equipoId', upload.single('image'),handleMulterError, EquiposController.update); // Ruta con IMG <-
router.delete('/equipo/:equipoId', EquiposController.eliminate);  
router.post('/equipo/create', upload.single('image'),handleMulterError, EquiposController.store); // Ruta con IMG <-
// Rutas de PARTIDOS (CRUD)
router.get('/partidos/:torneoId', PartidosController.index);
router.get('/partido/:torneoId/:partidoId', PartidosController.show);
router.put('/partido/:torneoId/:partidoId', PartidosController.update); 
router.delete('/partido/:torneoId/:partidoId', PartidosController.eliminate); 
router.post('/partido/create/:torneoId', PartidosController.store); 
// Rutas de NOTIFICACIONES (CRUD)
router.get('/notificaciones/:userId', NotificationController.index)
router.put('/notificaciones/:notificationId', NotificationController.update)
router.delete('/notificacion/:capitanEquipoId/:torneoId', NotificationController.eliminate)
router.post('/notificacion/:capitanEquipoId/:organizadorTorneoId', NotificationController.store);
// Rutas de PERFIL 
router.get('/perfil/:userId', ProfileController.show);
router.put('/perfil/:userId', upload.single('image'),handleMulterError, ProfileController.update); // Ruta con IMG <-
// Rutas de ESTADISTICAS 
router.get('/estadisticas/:id', EstadisticasController.index); 
router.get('/estadisticas/torneo/:torneoId', EstadisticasController.show); // Estadisticas de Torneo <-
router.get('/estadisticas/equipo/:equipoId/:equipoName', EstadisticasController.display); // Estadisticas de Equipo <-
// Rutas de IA (SERVER) 
router.put('/entrenamiento/equipo/AI/:equipoId', IAController.update); 
router.put('/entrenamiento/user/AI/:userId', IAController.edit); 
router.get('/estadisticas/AI/:userId', IAController.index); 

export default router;