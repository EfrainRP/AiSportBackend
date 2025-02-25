import { prisma } from '../prisma/db.js';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config(); // Cargar las variables de entorno

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // API Key de SendGrid
// Función para actualizar la nueva contraseña
export const passwordRestore = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId); // Obtiene el ID del usuario desde los parámetros de la URL
        const { newPassword } = req.body; // Obtiene la nueva contraseña desde el cuerpo de la solicitud
        console.log('Contraseña nueva: ',newPassword);
        if (!newPassword) {
            return res.status(400).json({ message: "La nueva contraseña es obligatoria." });
        }

        // Generar un hash de la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Buscar el usuario en la base de datos y actualizar la contraseña
        const user = await prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        
        return res.status(200).json({ message: "Contraseña actualizada con éxito." });

    } catch (error) {
        console.error("Error al restaurar la contraseña:", error);
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// Función para enviar el correo
export const emailSend = async (req, res) => {
    const userId = parseInt(req.params.userId); // Obtiene el ID del usuario desde los parámetros de la URL
    const subject = "Recuperación de contraseña";
    const text = "Todos los derechos reservados AiSport.";
    console.log('Email');
  try {
    // Buscar el usuario en la base de datos usando el userId
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    // Si no se encuentra el usuario, retornar un error
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userName = user.name;  // Obtener el nombre del usuario

    // Preparar el mensaje que se enviará
    const msg = {
        to: user.email, // Correo del usuario (existente)
        from: 'sporthub2711@gmail.com',  // Remitente verificado en SendGrid <- (Gmail sporthub)
        subject: subject, // Asunto del correo
        html: `  <!-- Estilos en línea para correo HTML -->
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  color: #333;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f7f7f7;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  background-color: #4CAF50;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                }
                .header h1 {
                  margin: 0;
                  color: white;
                  font-size: 24px;
                }
                .logo {
                  display: block;
                  margin: 0 auto 20px;
                  max-width: 80px;
                }
                .content {
                  padding: 20px;
                  color: #555;
                }
                .important {
                  color: #ff6347;
                  font-weight: bold;
                }
                .btn {
                  background-color:rgb(54, 56, 53);
                  color: white;
                  padding: 12px 20px;
                  text-decoration: none;
                  font-weight: bold;
                  border-radius: 4px;
                  display: inline-block;
                  margin-top: 20px;
                  text-align: center;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #aaa;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <!-- Header -->
                <div class="header">
                  <img class="logo" src="https://img.icons8.com/?size=100&id=bxKRTLFZYynA&format=png&color=000000" alt="Logo AiSport">
                  <h1>Recuperación de Contraseña AiSport</h1>
                </div>
      
                <!-- Content -->
                <div class="content">
                  <p>¡Hola <span class="important">${userName}</span>!</p>
                  <p>Te mandamos un cordial saludo desde AiSport. Se ha solicitado la recuperación de tu contraseña en nuestra plataforma.</p>
                  <p><strong>Importante:</strong> Si crees que se trata de un error, puedes ignorar este correo.</p>
                  <p>Tu contraseña actual en la plataforma será restablecida por tú anterior contraseña mediante este correo. <span class="important"></span></p>
                  <p>Recuerda, no compartas tu contraseña con nadie más y si tienes algún problema, no dudes en contactarnos.</p>
      
                  <!-- Button -->
                  <a href="https://www.aisport.com/recuperar-password" class="btn">Restablecer contraseña</a>
                </div>
      
                <!-- Footer -->
                <div class="footer">
                  <p>¡Gracias por ser parte de AiSport! 📧</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };
      
      // Enviar el correo usando SendGrid
      await sgMail.send(msg);
      

    console.log('📧 Correo enviado con éxito a:', user.email);
    res.json({ message: '📧 Correo enviado con éxito' });
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error.response?.body || error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
};
