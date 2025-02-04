import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import connect from './prisma/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Permitir todas las solicitudes CORS (comparticion de recursos a dominios externos)
app.use(cors());
app.use(express.json());
// Servir archivos estáticos desde la carpeta 'uploads' "imagenes" <-
app.use('/sporthub/api/utils/uploads', express.static(path.join(__dirname, 'utils/uploads')));

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/sporthub/api', userRoutes); //Carga de rutas

connect(); // Conecta a la base de datos

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

