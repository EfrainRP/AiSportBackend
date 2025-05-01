import { prisma } from '../prisma/db.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config(); // Cargar las variables de entorno

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // API Key de SendGrid
// Función para actualizar la nueva contraseña
export const passwordRestore = async (req, res) => {
  try {
      const { email, token, newPassword, confirmPassword } = req.body; // Recibe el email directamente del body

      console.log("Email y token recibido: ", email,token,newPassword,confirmPassword);

      // Validación de presencia
      if (!email || !newPassword || !confirmPassword) {
          return res.status(400).json({ message: "Todos los campos son obligatorios." });
      }

      // Confirmación de contraseñas
      if (newPassword !== confirmPassword) {
          return res.status(400).json({ message: "Las contraseñas no coinciden." });
      }

      // Validación de longitud mínima
      if (typeof newPassword !== 'string' || newPassword.length < 8) {
          return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres." });
      }

      // Buscar usuario por email y token válido
      const user = await prisma.users.findFirst({
          where: {
              email: email, // Buscar por email
              resetPasswordToken: token, // Comparar token recibido
              resetPasswordExpires: {
                  gte: new Date(), // Verificar que el token no haya expirado
              },
          },
      });

      // Validar existencia de usuario
      if (!user) {
          return res.status(400).json({ message: 'Token inválido, expirado o email incorrecto.' });
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualización de contraseña y limpieza de token
      await prisma.users.update({
          where: { id: user.id },
          data: {
              password: hashedPassword,
              resetPasswordToken: null, // Invalidar token
              resetPasswordExpires: null // Limpiar expiración
          }
      });

      console.log(`Contraseña actualizada para el usuario: ${email}`);
      return res.status(200).json({ message: "Contraseña actualizada con éxito." });

  } catch (error) {
      console.error("Error al restaurar la contraseña:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Función para enviar el correo
export const emailSend = async (req, res) => {
  const { email } = req.body; // Obtiene el email desde el body de la solicitud
  const subject = "Recuperación de contraseña";
  const text = "Todos los derechos reservados AiSport.";
  console.log('📨 Intentando enviar correo a:', email);
  
  try {
      // Buscar el usuario en la base de datos usando el email
      const user = await prisma.users.findUnique({
          where: { email }, // Buscar por email
      });

      // Si no se encuentra el usuario, retornar un error
      if (!user) {
          return res.status(404).json({ error: 'Sin coincidencias de correo' });
      }

      // Generar token JWT temporal para seguridad en el email
      const resetToken = jwt.sign(
          { userId: user.id }, 
          process.env.JWT_SECRET, 
          { expiresIn: '1h' } // 1 hora de expiración
      );

      // Guardar token y expiración en la base de datos
      await prisma.users.update({
          where: { id: user.id },
          data: {
              resetPasswordToken: resetToken,
              resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hora después
          }
      });

      // Link dependiendo del entorno (producción o desarrollo)
      const baseUrl = process.env.NODE_ENV === "production"
          ? process.env.DOMAIN
          : process.env.FRONTPORT;

      const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;


      const userName = user.name;  // Obtener el nombre del usuario

      // Preparar el mensaje que se enviará
      const msg = {
        to: user.email, 
        from: 'sporthub2711@gmail.com',  // Remitente verificado en SendGrid <- (Gmail sporthub)
        subject: subject, // Asunto del correo
        html: `  <!-- Estilos en línea para correo HTML -->
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña AiSport</title>
            <style>
              /* Estilos generales */
              body {
                background-color: #f0f0f0; /* Fondo gris claro */
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                color: #333;
              }

              /* Estilos del header */
              .header {
                background-color: #333; /* Fondo oscuro */
                color: white;
                text-align: center;
                padding: 20px;
              }

              .header img {
                width: 100px; /* Tamaño del logo */
                height: auto;
              }

              .header h1 {
                font-size: 28px;
                margin-top: 10px;
                font-weight: bold;
              }

              /* Estilos para el contenido */
              .content {
                background-color: #ffffff; /* Fondo blanco */
                max-width: 600px;
                margin: 0 auto;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }

              .content h2 {
                font-size: 24px;
                color: #333;
                margin-bottom: 15px;
              }

              .content p {
                font-size: 16px;
                color: #555;
                line-height: 1.6;
              }

              .content p.important {
                font-weight: bold;
                color: #d9534f; /* Rojo para resaltar */
              }

              /* Estilo del botón */
              .recovery-btn {
                display: inline-block;
                background-color: #FFD700; /* Color dorado */
                color: #333;
                text-decoration: none;
                padding: 15px 30px;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                border-radius: 5px;
                transition: background-color 0.3s, transform 0.3s ease-in-out;
                margin-top: 20px;
              }

              .recovery-btn:hover {
                background-color: #ffcc00; /* Dorado más oscuro al pasar el cursor */
                transform: scale(1.05);
              }

              .recovery-btn:focus {
                outline: none;
              }

              /* Estilo para el pie de página */
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #888;
              }

              .footer a {
                color: #333;
                text-decoration: none;
              }

              .footer a:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>

            <!-- Header -->
            <div class="header">
              <img src="https://img.icons8.com/?size=100&id=bxKRTLFZYynA&format=png&color=000000" alt="Logo AiSport">
              <h1>Recuperación de Contraseña</h1>
            </div>

            <!-- Contenedor del contenido principal -->
            <div class="content">
              <h2>¡Hola, <strong>${userName}</strong>!</h2>
              <p>Te enviamos este correo porque hemos recibido una solicitud para recuperar tu contraseña en AiSport.</p>
              <p><strong>Importante:</strong> Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
              <p>Para continuar con la recuperación de tu contraseña, por favor haz clic en el siguiente enlace:</p>
              <a href="${resetLink}" class="recovery-btn">Recuperar Contraseña</a>
              <p class="important">Recuerda, nunca compartas tu contraseña con nadie. Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos, tu enlace expira en una hora.</p>
              <p>Gracias por ser parte de AiSport. ¡Te deseamos lo mejor en tu entrenamiento!</p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} AiSport. Todos los derechos reservados.</p>
              <p>Si no solicitaste la recuperación de tu contraseña, por favor <a href="mailto:support@aisport.com">contáctanos</a>.</p>
            </div>

          </body>
          </html>
        `,
      };
      
      // Enviar el correo usando SendGrid
      await sgMail.send(msg);
      

    console.log('📧 Correo enviado con éxito con Token: ', user.email,resetToken);
    console.log("🔗 Enlace de recuperación generado:", resetLink);
    return res.json({ message: '📧 Correo enviado con éxito' });
  } catch (error) {
    
    console.error(process.env.SENDGRID_API_KEY);
    console.error('❌ Error al enviar el correo:', error.response?.body || error);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
};