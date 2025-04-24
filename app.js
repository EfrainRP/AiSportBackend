import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import connect from './prisma/db.js';
import path from 'path';
import cookieParser from 'cookie-parser'; // Install cookie-parser
import { helmetMiddleware } from './utils/helmetConfig.js'; // Import Helmet modular
import { removeSecurityHeadersOn404 } from './utils/Headers404.js'; // Import Headers 404
import { globalLimiter } from './utils/DoSLimit.js'; // DoS limit by user <-
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Aplica limitadores de solicitud por IP
app.use(globalLimiter);
// Configuración del middleware para parsear cookies
app.use(cookieParser());

// Seguridad con Helmet (protege contra XSS, Clickjacking, Sniffing)
helmetMiddleware().forEach(mw => app.use(mw));

app.use( // Solicitudes CORS fuera de Testing <-
  cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://aisport.com"] // Producción (Not available yet)
      : ["http://localhost:5173"], // Dominiio de Desarrollo (React JS en puerto 3000)
  })
);

// Middleware de JSON
app.use(express.json());
// Deshabilitar X-Powered-By (evita que se revele Express.js externamente)
app.disable('x-powered-by');
// Servir archivos estáticos desde la carpeta 'uploads' "imagenes" <-
app.use('/sporthub/api/utils/uploads', express.static(path.join(__dirname, 'utils/uploads')));

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/sporthub/api', userRoutes); //Carga de rutas

connect(); // Conecta a la base de datos

const port = process.env.PORT || 5000;

// Middleware para remover CSP en respuestas 404
app.use(removeSecurityHeadersOn404);

// Responder a cualquier solicitud HEAD 
app.head('*', (req, res) => {
  res.status(200).end();
});

// Conexiones externas en '0.0.0.0' (Interfaces de red para desarrollo)
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

/*
// Puerto para produccion
//app.listen(port, () => {
//  console.log(`Servidor corriendo en el puerto ${port}`);
//});
// Permitir todas las solicitudes CORS (comparticion de recursos a dominios externos y Testing)
app.use(
  cors({
    origin: "*", // Cualquier domino accceso
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
  })
);
*/

