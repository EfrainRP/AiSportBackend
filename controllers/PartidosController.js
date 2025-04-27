import { prisma } from '../prisma/db.js';
import {brackets, updateBracket} from "../utils/formatBracket.js";

// Index <- 
export const index = async (req, res) => {
  const torneoId = parseInt(req.params.torneoId); // Obtiene torneoId desde los parámetros de la URL

  try {
    // Consulta para obtener los partidos del torneo
    const cantEquipoTorneo = await prisma.torneos.findFirst({
      where: {
        id: torneoId
      },
      select: {
        cantEquipo: true,
      }
    });

    const partidos = await prisma.partidos.findMany({
      where: {
        torneo_id: torneoId, // Filtrar los partidos por el torneoId
      },
      orderBy: {
        ordenPartido: 'asc',
      },
      include: {
        equipos_partidos_equipoLocal_idToequipos: true, // Incluye los campos del equipo local
        equipos_partidos_equipoVisitante_idToequipos: true, // Incluye los campos del equipo visitante
        // siguiente_partido: true, // Incluye los campos del equipo visitante
      },
    });
    // console.log(partidos);
    
    const bracket = brackets(partidos, cantEquipoTorneo.cantEquipo);

    // console.log(bracket);
    // Responder con la lista de partidos
    res.status(200).json({ brackets: bracket, getPartidosCount: partidos.length, cantEquipoTorneo: cantEquipoTorneo.cantEquipo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los partidos", error });
  }
};
// ------------------------------------------------------------------------------------
// Show <- 
export const show = async (req, res) => {
  const { torneoId, partidoId } = req.params; // Obtener torneoId y partidoId de la URL
  console.log("Show ", torneoId, partidoId)
  try {
    // Obtiene el partido específico basado en torneoId y partidoId
    const partido = await prisma.partidos.findFirst({
      where: {
        id: parseInt(partidoId), // Convierte partidoId a número
        torneo_id: parseInt(torneoId), // Convierte torneoId a número
      },
      include: {
        torneos: true, // Incluir información del torneo relacionado
        equipos_partidos_equipoLocal_idToequipos: true, // Incluir campos del equipo local
        equipos_partidos_equipoVisitante_idToequipos: true, // Incluir campos del equipo visitante
      },
    });

    // Verifica si se encontró el partido
    if (!partido) {
      return res.status(404).json({ message: "Partido no encontrado o datos no coinciden" });
    }

    // Devuelve los datos del partido
    res.status(200).json(partido);
  } catch (error) {
    console.error('Error al obtener el partido:', error);
    res.status(500).json({ message: "Error al obtener el partido", error });
  }
};

//---------------------------------------------------------------------------------------
// Update <- 
export const update = async (req, res) => {
  const { torneoId, partidoId } = req.params;
  const { equipoLocalId, equipoVisitanteId, horaPartido, fechaPartido, jornada, resLocal, resVisitante, ordenPartido } = req.body;
  console.log("Datos del partido", resLocal, resVisitante, ordenPartido)

  try {
    // Validación de existencia del torneo
    const torneo = await prisma.torneos.findUnique({
      where: { id: Number(torneoId) },
    });

    if (!torneo) {
      return res.status(404).json({ field: 'torneoId', message: 'El torneo especificado no existe.' });
    }

    
    // Validación de si los equipos ya jugaron entre sí
    // const partidoExistente = await prisma.partidos.findFirst({
    //   where: {
    //     torneo_id: Number(torneoId),
    //     OR: [
    //       { equipoLocal_id: Number(equipoLocalId), equipoVisitante_id: Number(equipoVisitanteId) },
    //       { equipoLocal_id: Number(equipoVisitanteId), equipoVisitante_id: Number(equipoLocalId) },
    //     ],
    //   },
    // });
    // Validacion si los equipos a editar son los mismos o distintos
    // const equiposExistentes = await prisma.partidos.findFirst({
    //   where: { id: Number(partidoId) },
    // });

    // Validacion si el partido a editar es el ultimo (mas reciente) o no
    // En caso de no serlo, no se le permite cambiar de equipos al modificar la estructura del torneo de partidos ya posteriores <-
    // const ultimoPartido = await prisma.partidos.findFirst({
    //   where: { torneo_id: Number(torneoId) },    // Filtramos por torneo_id
    //   orderBy: { id: 'desc' }, // Ordenamos por fecha de manera descendente (más reciente primero)
    // });
    // Valida si los equipos ya han tenido un partido, o si son del partido más reciente del torneo <-
    // if (equiposExistentes.equipoLocal_id != equipoLocalId || equiposExistentes.equipoVisitante_id != equipoVisitanteId) {
      //console.log("Distintos")

      // Paso 2: Verificar si el partidoId corresponde al último partido
      // if (ultimoPartido.id !== Number(partidoId)) {
      //   console.log("PARTIDO NO ES EL MAS RECIENTE ")
      //   return res.status(400).json({
      //     field: 'partido',
      //     message: 'No es posible cambiar los equipos de un partido que no es el más reciente del torneo.'
      //   });
      // } 
      // Si los dos equipos ya han tenido un partido antes 
      // if (partidoExistente) {
      //   return res.status(400).json({
      //     field: 'equipo',
      //     message: 'Los equipos ya han tenido un partido en este torneo.'
      //   });
      // }
    // } else {
    //   console.log("IGUALES")
    // }
    // Valida si se actualizan los resultados del partido mas reciente o no <-
    // if (equiposExistentes.resLocal != resLocal || equiposExistentes.resVisitante != resVisitante) {
    //   if (ultimoPartido.id !== Number(partidoId)) {
    //     console.log("PARTIDO NO ES EL MAS RECIENTE ")
    //     return res.status(400).json({
    //       field: 'partido',
    //       message: 'No es posible cambiar los resultados de un partido que no es el más reciente del torneo.'
    //     });
    //   }
    // }

    // Validar campos nulos o vacíos
    if (!equipoLocalId) return res.status(400).json({ field: 'equipo', message: 'Los equipos son obligatorios.' });
    if (!equipoVisitanteId) return res.status(400).json({ field: 'equipo', message: 'Los equipos son obligatorios.' });
    if (!horaPartido) return res.status(400).json({ field: 'horaPartido', message: 'La hora del partido es obligatoria.' });
    if (!fechaPartido) return res.status(400).json({ field: 'fechaPartido', message: 'La fecha de partido es obligatoria.' });
    if (!jornada) return res.status(400).json({ field: 'jornada', message: 'La jornada es obligatoria.' });
    if (!resLocal === '' || resLocal < 0) return res.status(400).json({ field: 'resLocal', message: 'El resultado del equipo local debe ser mayor o igual a 0.' });
    if (!resVisitante === '' || resVisitante < 0) return res.status(400).json({ field: 'resVisitante', message: 'El resultado del equipo visitante debe ser mayor o igual a 0.' });

    // Calcular el número máximo de partidos posibles
    const partidosPosibles = torneo.cantEquipo - 1;

    // Obtener la cantidad de partidos ya creados para este torneo
    const partidosCreados = await prisma.partidos.count({
      where: {
        torneo_id: torneo.id,
      },
    });

    // Validación de si se han creado todos los partidos posibles
    if (partidosCreados >= partidosPosibles) {
      return res.status(400).json({ field: 'cantPartidos', message: 'Ya se han creado todos los partidos posibles para este torneo.' });
    }

    // Validación de equipo visitante y local
    if (equipoLocalId === equipoVisitanteId) {
      return res.status(400).json({ field: 'equipo', message: 'El equipo local y visitante no pueden ser el mismo.' });
    }

    // Validación de fechaPartido a un formato válido
    const parsedFechaPartido = new Date(fechaPartido);
    if (isNaN(parsedFechaPartido.getTime())) {
      return res.status(400).json({ field: 'fechaPartido', message: 'La fecha del partido no es válida.' });
    }

    // Validación de fechaPartido dentro de las fechas del torneo
    if (parsedFechaPartido < torneo.fechaInicio || parsedFechaPartido > torneo.fechaFin) {
      return res.status(400).json({
        field: 'fechaPartido',
        message: `La fecha del partido está fuera del rango del torneo. Las fechas válidas son desde ${torneo.fechaInicio.toISOString().split('T')[0]} hasta ${torneo.fechaFin.toISOString().split('T')[0]}.`
      });
    }

    // Validación de jornada como fecha
    const parsedJornada = new Date(jornada);
    if (isNaN(parsedJornada.getTime())) {
      return res.status(400).json({ field: 'jornada', message: 'La jornada no es una fecha válida.' });
    }

    // Validación de jornada dentro del rango del torneo
    if (parsedJornada < torneo.fechaInicio || parsedJornada > torneo.fechaFin) {
      return res.status(400).json({
        field: 'jornada',
        message: `La jornada está fuera del rango del torneo. Las fechas válidas son desde ${torneo.fechaInicio.toISOString().split('T')[0]} hasta ${torneo.fechaFin.toISOString().split('T')[0]}.`
      });
    }

    // Validación de equipoLocalId y equipoVisitanteId
    if (!equipoLocalId || !equipoVisitanteId) {
      return res.status(400).json({ field: 'equipo', message: 'Los IDs de los equipos local y visitante son obligatorios.' });
    }

    // Validación de horaPartido como formato
    if (!horaPartido || !/^\d{2}:\d{2}(:\d{2})?$/.test(horaPartido)) {
      return res.status(400).json({ field: 'horaPartido', message: 'La hora del partido no es válida. Debe tener formato HH:mm o HH:mm:ss.' });
    }

    // Convertir horaPartido en un formato válido (ISO 8601)
    const formattedHoraPartido = new Date(`${fechaPartido}T${horaPartido}:00`);

    if (isNaN(formattedHoraPartido.getTime())) {
      return res.status(400).json({ field: 'horaPartido', message: 'La hora del partido no es válida.' });
    }

    const partidoAntes = await prisma.partidos.findFirst({
      where: {
        id: Number(partidoId),
      },
    });

    const equipoLocalIdAntes = partidoAntes.equipoLocal_id;
    const equipoVisitanteIdAntes = partidoAntes.equipoVisitante_id;
    const resLocalAntes = partidoAntes.resLocal;
    const resVisitanteAntes = partidoAntes.resVisitante;

    // Validación da cambio de equipo local o visitante
    if (equipoLocalId !== equipoLocalIdAntes || equipoVisitanteId !== equipoVisitanteIdAntes || resLocal !== resLocalAntes || resVisitante !== resVisitanteAntes) {
      updateBracket(partidoId, torneoId);
      console.log('actualizado BRACKET');
    }

    // Actualizacion del partido y sus estadisticas mas recientes <-
    await prisma.$transaction(async (prisma) => {
      // Actualización del partido
      const partido = await prisma.partidos.update({
        where: { id: Number(partidoId) },
        data: {
          torneo_id: Number(torneoId),
          equipoLocal_id: Number(equipoLocalId),
          equipoVisitante_id: Number(equipoVisitanteId),
          horaPartido: formattedHoraPartido,
          fechaPartido: parsedFechaPartido,
          jornada: parsedJornada,
          resLocal: Number(resLocal),
          resVisitante: Number(resVisitante),
          ordenPartido: Number(ordenPartido),
        },
      });

      // Encuentra y actualiza la estadística más reciente del Equipo Local
      const latestLocalStat = await prisma.estadisticas.findFirst({
        where: {
          torneo_id: Number(torneoId),
          equipo_id: Number(equipoLocalId),
        },
        orderBy: {
          id: 'desc', // Ordenar por ID de mayor a menor
        },
      });

      if (latestLocalStat) {
        await prisma.estadisticas.update({
          where: {
            id: latestLocalStat.id, // Actualiza la estadística más reciente
          },
          data: {
            PT: Number(resLocal), // Puntos del equipo local
            CA: 0,
            DC: 0,
            CC: 0,
          },
        });
      }

      // Encuentra y actualiza la estadística más reciente del Equipo Visitante
      const latestVisitorStat = await prisma.estadisticas.findFirst({
        where: {
          torneo_id: Number(torneoId),
          equipo_id: Number(equipoVisitanteId),
        },
        orderBy: {
          id: 'desc', // Ordenar por ID de mayor a menor
        },
      });

      if (latestVisitorStat) {
        await prisma.estadisticas.update({
          where: {
            id: latestVisitorStat.id, // Actualiza la estadística más reciente
          },
          data: {
            PT: Number(resVisitante), // Puntos del equipo visitante
            CA: 0,
            DC: 0,
            CC: 0,
          },
        });
      }

      res.status(200).json({
        message: 'Partido y estadísticas más recientes actualizados correctamente',
        partido,
      });
    });
  } catch (error) {
    console.error('Error al actualizar el partido:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el partido.' });
  }
}
//--------------------------------------------------------------------------------------------
// STORE CREATE <-  
export const store = async (req, res) => {
  const { torneoId } = req.params;
  const { equipoLocalId, equipoVisitanteId, horaPartido, fechaPartido, jornada, resLocal, resVisitante, ordenPartido } = req.body;
  console.log("Datos del partido", torneoId, equipoLocalId, equipoVisitanteId)
  try {
    // Validación de existencia del torneo
    const torneo = await prisma.torneos.findUnique({
      where: { id: Number(torneoId) },
    });

    if (!torneo) {
      return res.status(404).json({ field: 'torneoId', message: 'El torneo especificado no existe.' });
    }

    // Validar campos nulos o vacíos
    if (!equipoLocalId) return res.status(400).json({ field: 'equipo', message: 'Los equipos son obligatorios.' });
    if (!equipoVisitanteId) return res.status(400).json({ field: 'equipo', message: 'Los equipos son obligatorios.' });
    if (!horaPartido) return res.status(400).json({ field: 'horaPartido', message: 'La hora del partido es obligatoria.' });
    if (!fechaPartido) return res.status(400).json({ field: 'fechaPartido', message: 'La fecha de partido es obligatoria.' });
    if (!jornada) return res.status(400).json({ field: 'jornada', message: 'La jornada es obligatoria.' });
    if (!resLocal === '' || resLocal < 0) return res.status(400).json({ field: 'resLocal', message: 'El resultado del equipo local debe ser mayor o igual a 0.' });
    if (!resVisitante === '' || resVisitante < 0) return res.status(400).json({ field: 'resVisitante', message: 'El resultado del equipo visitante debe ser mayor o igual a 0.' });

    // Validación de si los equipos ya jugaron entre sí
    // const partidoExistente = await prisma.partidos.findFirst({
    //   where: {
    //     torneo_id: Number(torneoId),
    //     OR: [
    //       { equipoLocal_id: Number(equipoLocalId), equipoVisitante_id: Number(equipoVisitanteId) },
    //       { equipoLocal_id: Number(equipoVisitanteId), equipoVisitante_id: Number(equipoLocalId) },
    //     ],
    //   },
    // });

    // if (partidoExistente) {
    //   return res.status(400).json({
    //     field: 'equipo',
    //     message: 'Los equipos ya han tenido un partido en este torneo.'
    //   });
    // }

    // Calcular el número máximo de partidos posibles
    const partidosPosibles = torneo.cantEquipo - 1;

    // Obtener la cantidad de partidos ya creados para este torneo
    const partidosCreados = await prisma.partidos.count({
      where: {
        torneo_id: torneo.id,
      },
    });

    // Validación de si se han creado todos los partidos posibles
    if (partidosCreados >= partidosPosibles) {
      return res.status(400).json({ field: 'cantPartidos', message: 'Ya se han creado todos los partidos posibles para este torneo.' });
    }

    // Validación de equipo visitante y local
    if (equipoLocalId === equipoVisitanteId) {
      return res.status(400).json({ field: 'equipo', message: 'El equipo local y visitante no pueden ser el mismo.' });
    }

    // Validación de fechaPartido a un formato válido
    const parsedFechaPartido = new Date(fechaPartido);
    if (isNaN(parsedFechaPartido.getTime())) {
      return res.status(400).json({ field: 'fechaPartido', message: 'La fecha del partido no es válida.' });
    }

    // Validación de fechaPartido dentro de las fechas del torneo
    if (parsedFechaPartido < torneo.fechaInicio || parsedFechaPartido > torneo.fechaFin) {
      return res.status(400).json({
        field: 'fechaPartido',
        message: `La fecha del partido está fuera del rango del torneo. Las fechas válidas son desde ${torneo.fechaInicio.toISOString().split('T')[0]} hasta ${torneo.fechaFin.toISOString().split('T')[0]}.`
      });
    }

    // Validación de jornada como fecha
    const parsedJornada = new Date(jornada);
    if (isNaN(parsedJornada.getTime())) {
      return res.status(400).json({ field: 'jornada', message: 'La jornada no es una fecha válida.' });
    }

    // Validación de jornada dentro del rango del torneo
    if (parsedJornada < torneo.fechaInicio || parsedJornada > torneo.fechaFin) {
      return res.status(400).json({
        field: 'jornada',
        message: `La jornada está fuera del rango del torneo. Las fechas válidas son desde ${torneo.fechaInicio.toISOString().split('T')[0]} hasta ${torneo.fechaFin.toISOString().split('T')[0]}.`
      });
    }

    // Validación de equipoLocalId y equipoVisitanteId
    if (!equipoLocalId || !equipoVisitanteId) {
      return res.status(400).json({ field: 'equipo', message: 'Los IDs de los equipos local y visitante son obligatorios.' });
    }

    // Validación de horaPartido como formato
    if (!horaPartido || !/^\d{2}:\d{2}(:\d{2})?$/.test(horaPartido)) {
      return res.status(400).json({ field: 'horaPartido', message: 'La hora del partido no es válida. Debe tener formato HH:mm o HH:mm:ss.' });
    }

    // Convertir horaPartido en un formato válido (ISO 8601)
    const formattedHoraPartido = new Date(`${fechaPartido}T${horaPartido}:00`);

    if (isNaN(formattedHoraPartido.getTime())) {
      return res.status(400).json({ field: 'horaPartido', message: 'La hora del partido no es válida.' });
    }

    // Validación de resLocal y resVisitante
    if (isNaN(resLocal) || resLocal < 0 || isNaN(resVisitante) || resVisitante < 0) {
      return res.status(400).json({ field: 'resultado', message: 'Los resultados deben ser números mayores o iguales a 0.' });
    }

    // Creación del partido
    const partido = await prisma.partidos.create({
      data: {
        torneo_id: Number(torneoId),
        equipoLocal_id: Number(equipoLocalId),
        equipoVisitante_id: Number(equipoVisitanteId),
        horaPartido: formattedHoraPartido,
        fechaPartido: parsedFechaPartido,
        jornada: parsedJornada,
        resLocal: Number(resLocal),
        resVisitante: Number(resVisitante),
        ordenPartido: Number(ordenPartido),
      },
    });
    // Creación de estadisticas del Equipo Local en ese Torneo <-
    const estadistica_local = await prisma.estadisticas.create({
      data: {
        torneo_id: Number(torneoId),
        equipo_id: Number(equipoLocalId), // Estadistica Equipo Local 
        PT: Number(resLocal), // Puntos por defecto del equipo Local <-
        CA: 0,
        DC: 0,
        CC: 0,
      },
    });

    // Creación de estadisticas del Equipo Visitante en ese Torneo <-
    const estadistica_visitante = await prisma.estadisticas.create({
      data: {
        torneo_id: Number(torneoId),
        equipo_id: Number(equipoVisitanteId), // Estadistica Equipo Visitante 
        PT: Number(resVisitante), // Puntos por defecto del equipo visitante <-
        CA: 0,
        DC: 0,
        CC: 0,
      },
    });

    res.status(201).json({ message: 'Partido creado exitosamente', partido, estadistica_local, estadistica_visitante });
  } catch (error) {
    console.error('Error al crear el partido:', error);
    res.status(500).json({ error: 'Hubo un error al crear el partido.' });
  }
};
//---------------------------------------------------------------------------------------
// Delete <- 
export const eliminate = async (req, res) => {
  const { torneoId, partidoId } = req.params; // Obtener torneoId y partidoId de la URL

  try {
    // Inicia una transacción para realizar múltiples consultas como atómicas
    await prisma.$transaction(async (prisma) => {
      // Obtiene el partido a eliminar para extraer equipoLocal_id y equipoVisitante_id
      const partido = await prisma.partidos.findUnique({
        where: {
          id: parseInt(partidoId),
        },
      });

      if (!partido) {
        throw new Error('Partido no encontrado');
      }

      const { equipoLocal_id, equipoVisitante_id } = partido;

      // Encuentra y elimina la estadística más reciente del equipo local en el torneo
      const latestLocalStat = await prisma.estadisticas.findFirst({
        where: {
          torneo_id: parseInt(torneoId),
          equipo_id: equipoLocal_id,
        },
        orderBy: {
          id: 'desc', // Ordenar por id de mayor a menor
        },
      });

      if (latestLocalStat) {
        await prisma.estadisticas.delete({
          where: {
            id: latestLocalStat.id,
          },
        });
      }

      // Encuentra y elimina la estadística más reciente del equipo visitante en el torneo
      const latestVisitorStat = await prisma.estadisticas.findFirst({
        where: {
          torneo_id: parseInt(torneoId),
          equipo_id: equipoVisitante_id,
        },
        orderBy: {
          id: 'desc', // Ordenar por id de mayor a menor
        },
      });

      if (latestVisitorStat) {
        await prisma.estadisticas.delete({
          where: {
            id: latestVisitorStat.id,
          },
        });
      }
      
      updateBracket(partidoId, torneoId);
      
      // Elimina el partido
      const deletedPartido = await prisma.partidos.delete({
        where: {
          id: parseInt(partidoId),
        },
      });

      res
        .status(200)
        .json({ message: 'Partido y estadísticas más recientes eliminados correctamente', partido: deletedPartido });
    });
  } catch (error) {
    console.error('Error al eliminar el partido y las estadísticas más recientes:', error);
    res.status(500).json({ error: 'No se pudo eliminar el partido y las estadísticas' });
  }
};
//---------------------------------------------------------------------------------------


