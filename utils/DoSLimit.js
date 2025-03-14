import rateLimit from 'express-rate-limit';

// Limite Global (para toda la API)
export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 100, // Máximo 100 peticiones por IP
  message: 'Se han excedido las solicitudes permitidas, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite específico para login (previene ataques de fuerza bruta por IP)
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // Máximo 5 intentos de login
  message: 'Demasiados intentos de inicio de sesión. Intente nuevamente después de 5 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
