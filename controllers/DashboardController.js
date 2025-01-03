import * as query from "../utils/queries.js";
import { prisma } from '../prisma/db.js';


export const dashIndex = async (req,res) =>{
  try{
    //MIS TORNEOS
      const torneosUser = await query.getTorneos(req.params.id,10);
      res.json(torneosUser);
  }catch(error){
    res.json({message: error.message})
  }
}
//----------------------------------------------------------------------------------
// Index <- Regresa todos los torneos y equipos a exepcion de los que pertenecen al usuario Auth 
export const index = async (req, res) => {
  const { userId } = req.params; // Extraer userId de los parámetros de la solicitud.
  try {
    // Consultar todos los torneos excepto los del usuario.
    const torneos = await prisma.torneos.findMany({
      where: {
        user_id: {
          not: parseInt(userId), // Excluir los torneos del usuario especificado.
        },
      },
    });

    // Consultar todos los equipos excepto los del usuario.
    const equipos = await prisma.equipos.findMany({
      where: {
        user_id: {
          not: parseInt(userId), // Excluir los equipos del usuario especificado.
        },
      },
    });

    const fechaActual = new Date(); // Fecha actual

    const proximosPartidos = await prisma.partidos.findMany({
      where: {
        fechaPartido: {
          gt: new Date(8/8/24), // Fecha (actual), gt es mayor que
        },
      },
      orderBy: {
        fechaPartido: 'asc', // Ordenar por fecha
      },
      select: {
        fechaPartido: true,
        horaPartido: true,
        equipoLocal: {
          select: {
            name: true,
          },
        },
        equipoVisitante: {
          select: {
            name: true,
          },
        },
        torneoDelPartido: { // Usa exactamente el nombre de la relación
          select: {
            name: true,
            ubicacion: true,
          },
        },
      },
      
    });


    // Enviar ambos resultados en una sola respuesta.
    res.status(200).json({
      torneos,
      equipos,
      proximosPartidos
    });
  } catch (error) {
    console.error('Error al obtener torneos y equipos:', error);
    res.status(500).json({ message: 'Error al obtener torneos y equipos' });
  }
};