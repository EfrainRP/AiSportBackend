import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import connect from './prisma/db.js';
import path from 'path';
import cookieParser from 'cookie-parser'; // Install cookie-parser
import helmet from 'helmet'; // Helmet para Seguridad en encabezados <-
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Configuración del middleware para parsear cookies
app.use(cookieParser());

// Seguridad con Helmet (protege contra XSS, Clickjacking, Sniffing)
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    reportOnly: false, // No permitir reportes en CE 404
    directives: {
      defaultSrc: ["'self'"], // Solo permite contenido del mismo dominio
      scriptSrc: ["'self'", "https://apis.google.com"], // Permitir Google API y scripts inline
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Permitir estilos en línea y Google Fonts
      fontSrc: ["'self'", "https://fonts.gstatic.com"], // Permitir fuentes de Google
      imgSrc: ["'self'", "data:", "https://img.icons8.com"], // Permitir imágenes locales, base64 y desde img.icons8.com
      connectSrc: ["'self'", "https://aisport.com"], // Permitir conexiones a API externa
      frameAncestors: ["'self'"], // Evita que el sitio sea embebido en iframes externos
      upgradeInsecureRequests: [], // Fuerza HTTPS
      formAction: ["'self'"], // Previene envío de formularios a dominios no autorizados
    }
  })
);

app.use( // Solicitudes CORS fuera de Testing <-
  cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://aisport.com"] // Producción (Not available yet)
      : ["http://localhost:3000"], // Dominiio de Desarrollo (React JS en puerto 3000)
  })
);

// Middleware de JSON
app.use(express.json());
// Evita ataques de Sniffing de MIME-Type <-
app.use(helmet.noSniff());
// Deshabilitar X-Powered-By (evita que se revele Express.js externamente)
app.disable('x-powered-by');

// Servir archivos estáticos desde la carpeta 'uploads' "imagenes" <-
app.use('/sporthub/api/utils/uploads', express.static(path.join(__dirname, 'utils/uploads')));

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/sporthub/api', userRoutes); //Carga de rutas

connect(); // Conecta a la base de datos

const port = process.env.PORT || 5000;

// Middleware para remover CSP en respuestas 404
app.use((req, res, next) => {
  res.status(404);

  // Remover todas las cabeceras de seguridad para CE 404
  const headersToRemove = [
    'Content-Security-Policy',
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Resource-Policy',
    'Origin-Agent-Cluster',
    'Referrer-Policy',
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-DNS-Prefetch-Control',
    'X-Download-Options',
    'X-Frame-Options',
    'X-Permitted-Cross-Domain-Policies',
    'X-XSS-Protection',
    'Vary'
  ];

  headersToRemove.forEach(header => res.removeHeader(header));

  // Responder con texto plano sin `Content-Type` ni contenido HTML en cabecera <-
  res.end(); // Devuelve un 404 sin contenido
});

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

