// Middleware para remover CSP en respuestas 404
export const removeSecurityHeadersOn404 = (req, res, next) => {
    res.status(404);
  
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
  
    res.end(); // Finaliza sin contenido
  };
  