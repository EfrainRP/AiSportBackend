import { prisma } from '../prisma/db.js';

// Actualiza las estadisticas mas antiguas (sin entrenamiento) de un partido del equipo <-
export const update = async (req, res) => {
  const equipoId = parseInt(req.params.equipoId); // Obtiene el ID del equipo desde los parámetros de la URL
  const { datos } = req.body; // Obtiene los valores enviados en el cuerpo de la solicitud
  // Validación y asignación directa
  const CA = Math.max(0, datos.prediction.data[0]); // Asegura que CA no sea menor a 0
  const DC = Math.max(0, datos.prediction.data[3]); // Asegura que DC no sea menor a 0
  const CC = Math.max(0, datos.prediction.data[7]) + Math.max(0, datos.prediction.data[8]); // Asegura que CC no sea menor a 0
  // CA (CANASTA ANOTADAS)
  // DC (DOMINIO DEL CONTROL)
  // CC (CONTEO DE CONTRAVENCIONES O FALTAS)
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

// Actualiza las estadísticas del user que ha entrenado
export const edit = async (req, res) => {
  const userId = parseInt(req.params.userId); // Obtiene el ID del usuario desde los parámetros de la URL
  const { datos } = req.body; // Obtiene los valores enviados en el cuerpo de la solicitud

  try {
    // Verifica si se proporcionaron datos
    if (!datos || !datos.prediction || !datos.prediction.data) {
      return res.status(400).json({ message: "Datos incompletos o incorrectos." });
    }

    const { performance, data } = datos.prediction;

    // Valida que el array `data` tenga al menos 9 elementos (SS, SA, TM, BC, DR, TO, ST, DD, TR)
    if (data.length < 9) {
      return res.status(400).json({ message: "El array de datos no tiene la longitud esperada." });
    }

    // Validacion y Mapeo de los valores recibidos de performance a los valores del ENUM
    const performanceMapping = {
      "Deficiente": "DEFICIENTE",
      "Mejorable": "MEJORABLE",
      "Bueno": "BUENO",
      "Muy bueno": "MUY_BUENO",
      "Excepcional": "EXCEPCIONAL"
    };

    // Valida el valor de `performance` sea válido para el enum
    const mappedPerformance = performanceMapping[performance] || "NA";

    // Función para validar que los valores sean enteros y mayores o iguales a 0 <-
    const ensureValidInteger = (value) => {
      const intValue = parseInt(value, 10);  // Convierte a entero
      return isNaN(intValue) || intValue < 0 ? 0 : intValue;  // Si no es un número válido o es menor a 0, asigna 0
    };

    // Mapear los valores de `data` a las métricas del modelo AI, asegurando que sean enteros y mayores a 0
    const newAIEntry = {
      user_id: userId,
      SS: ensureValidInteger(data[0]), // Validar y convertir a entero
      SA: ensureValidInteger(data[1]),
      TM: ensureValidInteger(data[2]),
      BC: ensureValidInteger(data[3]),
      DR: ensureValidInteger(data[4]),
      TO: ensureValidInteger(data[5]),
      ST: ensureValidInteger(data[6]),
      DD: ensureValidInteger(data[7]),
      TR: ensureValidInteger(data[8]),
      PF: mappedPerformance, // Si no se proporciona performance, se asigna "NA"
    };

    // Guarda los datos validados en la base de datos
    const createdAI = await prisma.aI.create({
      data: newAIEntry,
    });

    // Envia respuesta de vuelta
    res.status(201).json({
      message: "Estadísticas actualizadas correctamente.",
      data: createdAI,
    });
  } catch (error) {
    console.error("Error al actualizar las estadísticas:", error);
    res.status(500).json({ message: "Error al actualizar las estadísticas del usuario." });
  }
};

// Obtiene las estadísticas del usuario que ha entrenado con AI
export const index = async (req, res) => {
  const userId = parseInt(req.params.userId); // Obtiene el ID del usuario desde los parámetros de la URL

  try {
    // Obtener todas las estadísticas del usuario
    const estadisticas = await prisma.aI.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' }, // Ordenar por fecha
    });

    if (estadisticas.length === 0) {
      return res.status(404).json({ message: "No se encontraron estadísticas para este usuario." });
    }

    // Calcular las sumatorias de las métricas
    const totales = {
      SS: estadisticas.reduce((sum, registro) => sum + registro.SS, 0),
      SA: estadisticas.reduce((sum, registro) => sum + registro.SA, 0),
      TM: estadisticas.reduce((sum, registro) => sum + registro.TM, 0),
      BC: estadisticas.reduce((sum, registro) => sum + registro.BC, 0),
      DR: estadisticas.reduce((sum, registro) => sum + registro.DR, 0),
      TO: estadisticas.reduce((sum, registro) => sum + registro.TO, 0),
      ST: estadisticas.reduce((sum, registro) => sum + registro.ST, 0),
      DD: estadisticas.reduce((sum, registro) => sum + registro.DD, 0),
      TR: estadisticas.reduce((sum, registro) => sum + registro.TR, 0),
      PF: estadisticas.reduce((sum, registro) => sum + (registro.PF !== "NA" ? 1 : 0), 0), // Contar rendimientos válidos
    };

    // Contar la frecuencia de cada tipo de rendimiento
    const rendimientoCount = estadisticas.reduce((acc, registro) => {
      if (registro.PF !== "NA") {
        acc[registro.PF] = (acc[registro.PF] || 0) + 1;
      }
      return acc;
    }, {});

    // Determinar el rendimiento más frecuente
    let rendimientoFrecuente = "NA";
    if (Object.keys(rendimientoCount).length > 0) {
      // Orden de prioridad de los rendimientos (de menor a mayor)
      const ordenPrioridad = ["NA", "DEFICIENTE", "MEJORABLE", "BUENO", "MUY_BUENO", "EXCEPCIONAL"];

      // Encontrar el rendimiento con el conteo más alto
      const rendimientosEmpatados = Object.keys(rendimientoCount).filter(
        (rendimiento) =>
          rendimientoCount[rendimiento] ===
          Math.max(...Object.values(rendimientoCount))
      );

      // Si hay empate, seleccionar el rendimiento con mayor prioridad
      if (rendimientosEmpatados.length > 1) {
        rendimientoFrecuente = rendimientosEmpatados.reduce((a, b) =>
          ordenPrioridad.indexOf(a) > ordenPrioridad.indexOf(b) ? a : b
        );
      } else {
        rendimientoFrecuente = rendimientosEmpatados[0];
      }
    }

    // Envia los datos al frontend
    res.status(200).json({
      data: {
        estadisticas,
        totales,
        rendimientoFrecuente,
      },
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas:", error);
    res.status(500).json({ message: "Error al cargar las estadísticas del usuario." });
  }
};