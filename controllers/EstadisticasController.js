import { prisma } from '../prisma/db.js';

// INDEX <- Regresa todos los equipos que tienen estadisticas en SportHub
export const index = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
      // Consulta todos los equipos que tienen estadísticas registradas
      const equiposConEstadisticas = await prisma.estadisticas.findMany({
        distinct: ['equipo_id'], // Filtra registros únicos basados en `equipo_id`
        select: {
          equipo_id: true, // Obtiene el ID del equipo
          equipos: { // Relacion con equipos <-
            select: {
              name: true, // Obtiene el nombre del equipo relacionado
            },
          },
        },
      });
  
      // Formatear la respuesta para mejor visualizacion <-
      const resultado = equiposConEstadisticas.map((estadistica) => ({
        equipo_id: estadistica.equipo_id,
        name: estadistica.equipos.name,
      }));
  
      res.status(200).json({
        message: 'Equipos con estadísticas obtenidos',
        data: resultado,
      });
    } catch (error) {
      console.error('Error al obtener equipos con estadísticas:', error);
      res.status(500).json({
        message: 'Error al obtener equipos con estadísticas',
        error,
      });
    }
  };
//---------------------------------------------------------------------------------
// SHOW <- Regresa las estadisticas de los equipos en un torneo en particular 
export const show = async (req, res) => {
  const torneoId = parseInt(req.params.torneoId); // Obtiene el ID del torneo desde los parámetros de la URL

  try {
    // Consulta todas las estadísticas de los equipos en el torneo especificado
    const estadisticas = await prisma.estadisticas.findMany({
      where: {
        torneo_id: torneoId,
      },
      select: {
        id: true, // ID único de la estadística
        equipo_id: true, // ID del equipo relacionado
        equipos: {
          select: {
            name: true, // Nombre del equipo
          },
        },
        PT: true, // Puntos totales <-
        created_at: true, // Fecha de creación de la estadística
        updated_at: true, // Fecha de última actualización
      },
    });

    if (estadisticas.length === 0) {
      return res.status(404).json({
        message: `No se encontraron estadísticas para el torneo con ID ${torneoId}`,
      });
    }

    res.status(200).json({
      message: `Estadísticas de los equipos en el torneo con ID ${torneoId} obtenidas correctamente`,
      data: estadisticas,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del torneo:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas del torneo',
      error,
    });
  }
};
//---------------------------------------------------------------------------------
// DISPLAY <- Regresa las estadisticas totales de un equipo en particular en SportHub
export const display = async (req, res) => {
  const equipoId = parseInt(req.params.equipoId); // ID del equipo desde los parámetros de la URL
  const equipoName = req.params.equipoName; // Nombre del equipo desde los parámetros de la URL

  try {
      // Consulta todas las estadísticas relacionadas con el equipo especificado y verifica el nombre
      const estadisticas = await prisma.estadisticas.findMany({
          where: { 
              equipo_id: equipoId,
              equipos: {
                  name: equipoName, // Filtrar por nombre del equipo
              },
          },
          select: {
              PT: true, // Puntos totales
              CA: true, // Canastas Anotadas
              DC: true, // DC
              CC: true, // CC
              created_at: true, // Fecha de registro de las estadísticas
          },
      });

      if (estadisticas.length === 0) {
          return res.status(404).json({
              message: `No se encontraron estadísticas para el equipo con ID ${equipoId} y nombre "${equipoName}"`,
          });
      }

      // Suma las estadísticas totales del equipo
      const totales = estadisticas.reduce(
          (acumulador, registro) => {
              acumulador.PT += registro.PT;
              acumulador.CA += registro.CA;
              acumulador.DC += registro.DC;
              acumulador.CC += registro.CC;
              return acumulador;
          },
          { PT: 0, CA: 0, DC: 0, CC: 0 } // Valores iniciales
      );

      res.status(200).json({
          message: `Estadísticas del equipo con ID ${equipoId} y nombre "${equipoName}" obtenidas correctamente`,
          data: {
              estadisticas, // Lista de estadísticas individuales
              totales, // Suma total de las estadísticas
          },
      });
  } catch (error) {
      console.error('Error al calcular estadísticas del equipo:', error);
      res.status(500).json({
          message: 'Error al calcular estadísticas del equipo',
          error,
      });
  }
};

  