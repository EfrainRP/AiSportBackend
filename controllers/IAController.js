import { prisma } from '../prisma/db.js';

export const update = async (req, res) => {
  const equipoId = parseInt(req.params.equipoId); // Obtiene el ID del equipo desde los parámetros de la URL
  const { CA, DC, CC } = req.body; // Obtiene los valores enviados en el cuerpo de la solicitud

  try {
    // Encuentra la estadística más reciente para el equipo que no haya tenido un entrenamiento con IA
    // (Sus valores aun son 0)
    let estadistica = await prisma.estadisticas.findFirst({
      where: {
        equipo_id: equipoId,
      },
      orderBy: {
        id: 'desc', // Orden por ID descendente, para obtener la más reciente
      },
    });

    if (!estadistica) {
      return res.status(404).json({ message: 'Estadística no encontrada' });
    }

    // Verificar si los valores CA, DC, y CC de la estadística más reciente son 0
    if (estadistica.CA === 0 && estadistica.DC === 0 && estadistica.CC === 0) {
      // Si los valores son 0, actualiza con los valores enviados
      estadistica = await prisma.estadisticas.update({
        where: {
          id: estadistica.id,
        },
        data: {
          CA,
          DC,
          CC,
        },
      });

      return res.status(200).json({
        message: 'Estadística actualizada correctamente con valores 0',
        data: estadistica,
      });
    }

    // Si no hay ninguna estadística con los valores 0 en sus 3 campos (no actualizada o entrenada), 
    // busca la estadística con los valores más bajos en CA, DC y CC
    const estadisticaBaja = await prisma.estadisticas.findFirst({
        where: {
          equipo_id: equipoId,
          OR: [
            { CA: { not: 0 } },
            { DC: { not: 0 } },
            { CC: { not: 0 } },
          ],
        },
        orderBy: [
          { CA: 'asc' },  // Orden por CA de manera ascendente
          { DC: 'asc' },  // Orden por DC de manera ascendente
          { CC: 'asc' },  // Orden por CC de manera ascendente
        ],
      });

    // Si encuentra una estadística con valores no 0, la actualizamos con los nuevos valores
    if (estadisticaBaja) {
      estadistica = await prisma.estadisticas.update({
        where: {
          id: estadisticaBaja.id,
        },
        data: {
          CA,
          DC,
          CC,
        },
      });

      return res.status(200).json({
        message: 'Estadística actualizada correctamente con los valores más bajos',
        data: estadistica,
      });
    }

    // Si no encuentra ninguna estadística válida, manda un error
    res.status(404).json({ message: 'No hay estadísticas con valores válidos para actualizar' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la estadística' });
  }
};
