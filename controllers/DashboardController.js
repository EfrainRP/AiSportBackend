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
  console.log("Regresando index");
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

    // Enviar ambos resultados en una sola respuesta.
    res.status(200).json({
      torneos,
      equipos,
    });
  } catch (error) {
    console.error('Error al obtener torneos y equipos:', error);
    res.status(500).json({ message: 'Error al obtener torneos y equipos' });
  }
};