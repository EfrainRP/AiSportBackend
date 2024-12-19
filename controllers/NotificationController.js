import { prisma } from '../prisma/db.js';

// Index Regresa todas las notificaciones del Usuario Logueado con sus status (Accepted|Rejected)<-
export const index = async (req, res) => {
    const userId = parseInt(req.params.userId); // Obtener el ID de usuario de los parámetros

    try {
        // Consulta a la base de datos para obtener las notificaciones con el user_id (emisor) y status
        const notifications = await prisma.notifications.findMany({
            where: {
                user_id: userId, // Coincide con el user_id en la tabla de notificaciones
                status: {
                    in: ['accepted', 'rejected'], // Filtrar por status 'accepted' o 'rejected'
                },
            },
            include: {
                torneos: {
                    select: {
                        name: true, // Obtener el nombre del torneo
                        user_id: true, // Obtener el user_id del torneo
                        users: { // Incluir los datos del usuario relacionado con el torneo
                            select: {
                                name: true, // Obtener el nombre del usuario
                                email: true, // Obtener el correo del usuario
                            },
                        },
                    },
                },
                equipos: { // Relacion de equipo con la notificacion <-
                    select: {
                        name: true, // Obtener el nombre del equipo
                    },
                },
            },
        });
        // Enviar las notificaciones con el torneo y equipo relacionados
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
};
//----------------------------------------------------------------------------------
// Status Actualiza el estado de la notificacion como / (Accepted | Rejected) <-
export const update = async (req, res) => {
  const notificationId = parseInt(req.params.notificationId); // Obtener el notificationId de los parámetros
  const { status } = req.body; // Obtener el status desde el cuerpo de la solicitud

  //console.log("NOTI", notificationId, status); // Mostrar en consola para ver los valores
  try {
    // Verificar si el estado es válido
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Estado no válido. Los valores permitidos son: accepted, rejected, pending.' });
    }

    // Actualizar la notificación en la base de datos
    const updatedNotification = await prisma.notifications.update({
      where: {
        id: notificationId, // Buscar la notificación por su ID
      },
      data: {
        status: status, // Actualizar el status con el valor recibido
      },
    });

    // Enviar la respuesta con la notificación actualizada
    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("Error al actualizar la notificación:", error);
    return res.status(500).json({ error: 'Hubo un error al actualizar la notificación.' });
  }
};
//----------------------------------------------------------------------------------
// Store Crea una Notificacion desde Usuario Logueado hacia Usuario Organizador del Torneo
export const store = async (req, res) => {
    try {
      // Datos desde los parámetros de la URL
      const capitanEquipoId = parseInt(req.params.capitanEquipoId);
      const organizadorTorneoId = parseInt(req.params.organizadorTorneoId);
  
      // Datos del cuerpo de la solicitud
      const { equipoId, torneoId } = req.body;
  
      // Validación básica de los datos recibidos
      if (!capitanEquipoId || !organizadorTorneoId || !equipoId || !torneoId) {
        return res.status(400).json({
          message: 'Faltan datos obligatorios para crear la notificación.',
        });
      }
  
      // Verificar si ya existe una notificación enviada por el mismo capitanEquipoId para el mismo torneoId
      const notificacionExistente = await prisma.notifications.findFirst({
        where: {
          torneo_id: Number(torneoId),
          user_id: capitanEquipoId, // Validar por capitanEquipoId
          status: {
            in: ['pending', 'accepted', 'rejected'], // Busca cualquiera de los tres estados
          },
        },
      });
  
      if (notificacionExistente) {
        return res.status(400).json({
          message: 'Lo sentimos, solo puedes mandar una sola solicitud de inscripción por torneo.',
        });
      }
  
      // Crear la notificación en la base de datos
      const nuevaNotificacion = await prisma.notifications.create({
        data: {
          equipo_id: Number(equipoId),
          torneo_id: Number(torneoId),
          user_id: capitanEquipoId, // Usuario que envía la notificación
          user_id2: organizadorTorneoId, // Usuario que recibe la notificación
          status: 'pending', // Estado inicial de la notificación
        },
      });
  
      // Responder al cliente con la nueva notificación
      return res.status(201).json({
        message: 'Notificación creada con éxito.',
        notification: nuevaNotificacion,
      });
    } catch (error) {
      console.error('Error al crear la notificación:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al crear la notificación.',
        error: error.message,
      });
    }
  };
  // -----------------------------------------------------------------------------
  // Delete CapitanId to TorneoId Notification <-
  export const eliminate = async (req, res) => {
    
    try {
      // Parametros desde la URL 
      const capitanEquipoId = parseInt(req.params.capitanEquipoId);
      const torneoId = parseInt(req.params.torneoId);
      console.log('ENTRO',capitanEquipoId,torneoId)
      // Valida los campos obligatorios
      if (!capitanEquipoId || !torneoId) {
        return res.status(400).json({
          message: 'Faltan datos obligatorios para cancelar la notificación.',
        });
      }
  
      const notificacionExistente = await prisma.notifications.findFirst({
        where: {
          user_id: capitanEquipoId,
          torneo_id: torneoId,
          status: {
            in: ['pending', 'accepted', 'rejected'], // Busca cualquiera de los tres estados
          },
        },
      });
  
      if (!notificacionExistente) {
        return res.status(404).json({
          message: 'No se encontró una notificación pendiente para cancelar.',
        });
      }
  
      await prisma.notifications.delete({
        where: {
          id: notificacionExistente.id,
        },
      });
  
      return res.status(200).json({
        message: 'Notificación cancelada con éxito.',
      });
    } catch (error) {
      console.error('Error al cancelar la notificación:', error);
      return res.status(500).json({
        message: 'Ocurrió un error al cancelar la notificación.',
        error: error.message,
      });
    }
  };
  
  
