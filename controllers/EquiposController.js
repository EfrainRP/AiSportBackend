import { prisma } from '../prisma/db.js';

  // INDEX
  export const index = async (req, res) => {
      // Obtiene el ID del usuario actual (logueado) <-
      const userId = parseInt(req.params.id);
      //console.log("UserId recibido:", userId); 
    
      try {
        // Consulta para obtener los equipos relacionados al usuario
        const equipos = await prisma.equipos.findMany({
          where: {
            user_id: userId, // Filtra por el ID del usuario
          },
        });
    
        res.status(200).json(equipos);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los equipos", error });
      }
    };
   //--------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // SHOW
  export const show = async (req, res) => {
    const equipoId = parseInt(req.params.equipoId); // Obtiene el ID del equipo desde los parámetros de la URL
    const equipoName = req.params.equipoName; // Obtiene el nombre del equipo desde los parámetros de la URL

    try {
      // Consulta para obtener un solo equipo y sus miembros
      const equipo = await prisma.equipos.findFirst({
        where: {
          id: equipoId, // Filtra por el ID del equipo
          name: equipoName, // Filtra también por el equipo del torneo
        },
        include: {
          miembro_equipos: true, // Incluye los miembros relacionados
          users: true, // Incluye el usuario creador del equipo
        },
      });
  
      // Verifica si se encontró el equipo
      if (!equipo) {
        return res.status(404).json({ message: "Equipo no encontrado" });
      }
  
      res.status(200).json(equipo); // Responde con los datos del equipo y sus miembros
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener el equipo", error });
    }
  };
  // ---------------------------------------------------------------------------------
  // FORM UPDATE
  export const update = async (req, res) => {
    const equipoId = parseInt(req.params.equipoId); // Obtiene el ID del equipo desde los parámetros de la URL
    const { name, miembros } = req.body; // Obtiene los datos enviados en la solicitud
    let image = undefined;
    console.log('Miembros recibidos:', miembros);
    
    if (req.file) {
      console.log('Archivo subido:', req.file);
      image = req.file.filename;
    } else {
      console.log('No se subió ninguna imagen.');
    }

    // Verificar si `miembros` es un arreglo antes de usar map()
    if (!Array.isArray(miembros)) {
      return res.status(400).json({
        message: 'El campo "miembros" debe ser un arreglo de miembros.',
      });
    }

    try {
      // Busca el equipo por ID
      const equipo = await prisma.equipos.findFirst({
        where: { id: equipoId },
        include: { miembro_equipos: true }, // Incluir los miembros actuales
      });

      if (!equipo) {
        return res.status(404).json({ message: 'Equipo no encontrado.' });
      }

      // Validación 1: Nombre obligatorio.
      if (!name) {
        return res.status(400).json({
          field: 'name',
          message: 'El nombre del equipo es obligatorio.'
        });
      }

      // Verificar si el nombre ha cambiado
      if (name !== equipo.name) {
        // Validar si el nombre ya existe en otro equipo
        const existingEquipo = await prisma.equipos.findFirst({
          where: { name },
        });

        if (existingEquipo) {
          return res.status(400).json({
            field: 'name',
            message: 'El nombre del equipo ya existe.'
          });
        }
      }

      // Actualiza los datos del equipo
      const updatedEquipo = await prisma.equipos.update({
        where: { id: equipoId },
        data: {
          name,
          image: image || undefined, // Imagen cargada
          // Maneja la relación de miembros
          miembro_equipos: {
            deleteMany: {}, // Elimina todos los miembros actuales
            create: miembros.map((miembro) => ({
              user_miembro: miembro.user_miembro, // Solo pasa la cadena user_miembro
            })), // Crea los nuevos miembros
          },
        },
      });

      // Devuelve el equipo actualizado
      res.status(200).json(updatedEquipo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al actualizar el equipo.' });
    }
};
  // ---------------------------------------------------------------------------------
  // FORM STORE
  export const store = async (req, res) => {
    try {
        const { name, user_id, miembros } = req.body;
        console.log("Crear equipo", user_id, miembros,name);
        
        let image = undefined;
        if (req.file) {
            console.log('Archivo subido:', req.file);
            image = req.file.filename;
        } else {
            console.log('No se subió ninguna imagen.');
        }    

        // Validación 1: Todos los campos son requeridos
        if (!name || !user_id || !miembros || !Array.isArray(miembros) || miembros.length === 0) {
            return res.status(400).json({ message: "Todos los campos son requeridos." });
        }
       
        // Validación 3: El nombre del equipo debe ser único
        const existingTeam = await prisma.equipos.findFirst({ where: { name } });
        if (existingTeam) {
            return res.status(400).json({ message: "El nombre del equipo ya existe. Por favor, elige otro." });
        }

        // Crear el equipo en la base de datos
        const equipo = await prisma.equipos.create({
            data: {
                name,
                image: image || undefined, // Imagen cargada
                user_id: Number(user_id), 
                miembro_equipos: {
                    create: miembros.map((miembro) => ({ // Mapear sus miembros respectivos en relación
                        user_miembro: miembro, // Solo pasa la cadena user_miembro
                    })),
                },
            },
        });

        return res.status(201).json({ message: "Equipo creado exitosamente.", equipo });
    } catch (error) {
        console.error("Error al crear el equipo: ", error);

        // Manejo de errores de Prisma (restricciones únicas)
        if (error.code === 'P2002') { // Error por restricción de unicidad
            return res.status(400).json({ message: "Error de restricción en DB." });
        }

        return res.status(500).json({ message: "Error interno del servidor." });
    }
};

// -------------------------------------------------------------------------------------
// DELETE 
export const eliminate = async (req, res) => {
  const { equipoId } = req.params;

  try {
    // Convertir equipoId a entero
    const equipoIdInt = parseInt(equipoId, 10);

    if (isNaN(equipoIdInt)) {
      return res.status(400).json({ message: 'El ID del equipo no es válido' });
    }

    // Paso 1: Validar si el equipo está participando en algún partido como local o visitante
    const equipoEnPartido = await prisma.partidos.findFirst({
      where: {
        OR: [
          { equipoLocal_id: equipoIdInt },
          { equipoVisitante_id: equipoIdInt },
        ],
      },
    });

    if (equipoEnPartido) {
      return res.status(400).json({
        message: 'No se puede eliminar al equipo porque está participando en un partido.',
      });
    }

    // Paso 2: Eliminar el equipo si no está participando en ningún partido
    const equipoEliminado = await prisma.equipos.delete({
      where: { id: equipoIdInt },
    });

    res.status(200).json({ message: 'Equipo eliminado con éxito', equipo: equipoEliminado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar el equipo' });
  }
};


