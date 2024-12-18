import { prisma } from '../prisma/db.js';
  // INDEX
  export const index = async (req, res) => {
      // Obtiene el ID del Usuario autenticado <-
      const userId = parseInt(req.params.id);
      //console.log("UserId recibido:", userId); 
    
      try {
        // Consulta para obtener los torneos relacionados al usuario
        const torneos = await prisma.torneos.findMany({
          where: {
            user_id: userId, // Filtra por el ID del usuario
          },
        });
    
        res.status(200).json(torneos);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los torneos", error });
      }
    };
  // ---------------------------------------------------------------------------------
  // SHOW
  export const show = async (req, res) => {
    const torneoId = parseInt(req.params.torneoId); // Obtiene el ID del torneo desde los parámetros de la URL
    const torneoName = req.params.torneoName; // Obtiene el nombre del torneo desde los parámetros de la URL
  
    try {
      // Consulta para obtener un solo torneo basado en el ID y el nombre
      const torneo = await prisma.torneos.findFirst({
        where: {
          id: torneoId, // Filtra por el ID del torneo
          name: torneoName, // Filtra también por el nombre del torneo
        },
        include: {
          users: true, // Incluye el usuario relacionado
        },
      });
  
      // Verifica si se encontró el torneo
      if (!torneo) {
        return res.status(404).json({ message: "Torneo no encontrado o datos no coinciden" });
      }
  
      res.status(200).json(torneo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener el torneo", error });
    }
  };
  
  // ---------------------------------------------------------------------------------
  // FORM UPDATE
  export const update = async (req, res) => {
    const torneoId = parseInt(req.params.torneoId);
    const { name, ubicacion, descripcion, fechaInicio, fechaFin, cantEquipo } = req.body;
  
    try {
      // Obtener el torneo actual desde la base de datos
      const currentTorneo = await prisma.torneos.findUnique({
        where: { id: torneoId },
      });
  
      if (!currentTorneo) {
        return res.status(404).json({ message: 'Torneo no encontrado.' });
      }
  
      // Validar campos nulos o vacíos
      if (!ubicacion) return res.status(400).json({ field: 'ubicacion', message: 'La ubicación es obligatoria.' });
      if (!descripcion) return res.status(400).json({ field: 'descripcion', message: 'La descripción es obligatoria.' });
      if (!fechaInicio) return res.status(400).json({ field: 'fechaInicio', message: 'La fecha de inicio es obligatoria.' });
      if (!fechaFin) return res.status(400).json({ field: 'fechaFin', message: 'La fecha de fin es obligatoria.' });
      if (!cantEquipo) return res.status(400).json({ field: 'cantEquipo', message: 'La cantidad de equipos es obligatoria.' });
  
      // Validar nombre del torneo solo si ha cambiado
      if (name && name !== currentTorneo.name) {
        const existingTorneo = await prisma.torneos.findFirst({
          where: { name, id: { not: torneoId } }, // Buscar un torneo con el mismo nombre pero diferente ID
        });
  
        if (existingTorneo) {
          return res.status(400).json({ field: 'name', message: 'El nombre del torneo ya existe.' });
        }
      }
  
      // Validar fechas
      const now = new Date();
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
  
      if (startDate < now) {
        return res.status(400).json({ field: 'fechaInicio', message: 'La fecha de inicio no puede ser menor o igual a la fecha actual.' });
      }
  
      if (startDate >= endDate) {
        return res.status(400).json({ field: 'fechaInicio', message: 'La fecha de inicio debe ser menor que la fecha de fin.' });
      }
  
      if (endDate <= now) {
        return res.status(400).json({ field: 'fechaFin', message: 'La fecha de fin debe ser mayor a la fecha actual.' });
      }
  
      // Validar cantidad de equipos
      const cantEquipoInt = parseInt(cantEquipo);
      if (cantEquipoInt < 4 || cantEquipoInt > 32 || cantEquipoInt % 2 !== 0) {
        return res.status(400).json({
          field: 'cantEquipo',
          message: 'La cantidad de equipos mímina y máxima permitida es de 4, 8, 16 y 32.',
        });
      }
  
      // Actualizar el torneo
      const updatedTorneo = await prisma.torneos.update({
        where: { id: torneoId },
        data: {
          name,
          ubicacion,
          descripcion,
          fechaInicio: startDate,
          fechaFin: endDate,
          cantEquipo: cantEquipoInt,
        },
      });
  
      // Enviar mensaje de éxito
      res.status(200).json({
        message: 'Torneo actualizado con éxito.',
        updatedTorneo,
      });
    } catch (error) {
      console.error('Error al actualizar el torneo:', error);
      res.status(500).json({ message: 'Error al actualizar el torneo', error });
    }
  };
  //-----------------------------------------------------------------------------------
  // FORM STORE
  export const store = async (req, res) => {
    const { name, ubicacion, descripcion, fechaInicio, fechaFin, cantEquipo, userId } = req.body;
  
    try {
      // Validar campos nulos o vacíos
      if (!ubicacion) return res.status(400).json({ field: 'ubicacion', message: 'La ubicación es obligatoria.' });
      if (!descripcion) return res.status(400).json({ field: 'descripcion', message: 'La descripción es obligatoria.' });
      if (!fechaInicio) return res.status(400).json({ field: 'fechaInicio', message: 'La fecha de inicio es obligatoria.' });
      if (!fechaFin) return res.status(400).json({ field: 'fechaFin', message: 'La fecha de fin es obligatoria.' });
      if (!cantEquipo) return res.status(400).json({ field: 'cantEquipo', message: 'La cantidad de equipos es obligatoria.' });
      if (!userId) return res.status(400).json({ field: 'userId', message: 'El ID de usuario es obligatorio.' });
  
      // Validar que no exista un torneo con el mismo nombre
      const existingTorneo = await prisma.torneos.findFirst({
        where: { name },
      });
  
      if (existingTorneo) {
        return res.status(400).json({
          field: 'name',
          message: 'El nombre del torneo ya existe.',
        });
      }
  
      // Validar fechas
      const now = new Date();
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
  
      if (startDate < now) {
        return res.status(400).json({ field: 'fechaInicio', message: 'La fecha de inicio no puede ser menor o igual a la fecha actual.' });
      }
  
      if (startDate >= endDate) {
        return res.status(400).json({ field: 'fechaInicio', message: 'La fecha de inicio debe ser menor que la fecha de fin.' });
      }
  
      if (endDate <= now) {
        return res.status(400).json({ field: 'fechaFin', message: 'La fecha de fin debe ser mayor a la fecha actual.' });
      }
  
      // Validar cantidad de equipos
      const cantEquipoInt = parseInt(cantEquipo);
      if (cantEquipoInt < 4 || cantEquipoInt > 32 || cantEquipoInt % 2 !== 0) {
        return res.status(400).json({
          field: 'cantEquipo',
          message: 'La cantidad de equipos mímina y máxima permitida es de 4, 8, 16 y 32.',
        });
      }
  
      // Crear torneo
      const newTorneo = await prisma.torneos.create({
        data: {
          name,
          ubicacion,
          descripcion,
          fechaInicio: startDate,
          fechaFin: endDate,
          cantEquipo: cantEquipoInt,
          user_id: userId, // Asocia el ID del usuario de torneo al user_id  <-
        },
      });
  
      return res.status(201).json({
        message: 'Torneo creado con éxito!',
        torneo: newTorneo,
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Error inesperado al crear el torneo.',
      });
    }
  };
    //--------------------------------------------------------------
    // DELETE
    export const eliminate = async (req, res) => {
        const torneoId = parseInt(req.params.torneoId);
        console.log("Id recibido:", torneoId);
      
        try {
          // Elimina el torneo por su ID 
          const torneoEliminado = await prisma.torneos.delete({
            where: {
              id: torneoId, // campo de modelo "id"
            },
          });
      
          // Si no se encuentra el torneo, enviar error
          if (!torneoEliminado) {
            return res.status(404).json({ message: 'Torneo no encontrado' });
          }
      
          // Regresa mensaje de éxito
          return res.status(200).json({ message: 'Torneo eliminado con éxito' });
        } catch (err) {
          // Si hay un error, el torneo no existe o fallo la conexión con la base de datos
          console.error(err);
          return res.status(500).json({ message: 'Error al eliminar el torneo' });
        }
      };
      
      