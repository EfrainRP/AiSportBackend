import helmet from 'helmet';

export const helmetMiddleware = () => [
  helmet(),
  helmet.noSniff(), // Evita ataques de Sniffing de MIME-Type <-
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
];
