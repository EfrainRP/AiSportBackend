import helmet from 'helmet';

export const helmetMiddleware = () => [
  helmet(),
  helmet.noSniff(), // Evita ataques de Sniffing de MIME-Type <-
  helmet.contentSecurityPolicy({
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://img.icons8.com"],
      connectSrc: ["'self'", "https://aisport.com"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
      formAction: ["'self'"]
    }
  })
];
