import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import connect from './prisma/db.js';
import path from 'path';
import cookieParser from 'cookie-parser';
import { helmetMiddleware } from './utils/helmetConfig.js';
import { removeSecurityHeadersOn404 } from './utils/Headers404.js';
import { globalLimiter } from './utils/DoSLimit.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 5000;

const app = express();

// Seguridad y prevención de ataques
app.disable('x-powered-by');

app.use(cookieParser());
helmetMiddleware().forEach(mw => app.use(mw));

// CORS principal
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? [process.env.DOMAIN]
    : [process.env.FRONTPORT],
  credentials: true,
  methods: "GET, POST, PUT, DELETE",
  allowedHeaders: "Content-Type, Authorization",
}));

// Static files (imagenes)
app.use(
  '/sporthub/api/utils/uploads',
  cors({ origin: process.env.FRONTPORT, credentials: true }),
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, 'utils/uploads'))
);

// JSON parser
app.use(express.json());

// Frontend build (React)
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Rutas API
app.use('/sporthub/api', userRoutes);

// Conectar a base de datos
connect();

// HEAD response vacía
app.head('*', (req, res) => {
  res.status(200).end();
});

// 404 personalizado sin headers de seguridad (para evitar errores CSP en frontend)
app.use(removeSecurityHeadersOn404);

// Server listener
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

