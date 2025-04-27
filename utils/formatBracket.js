import bracket4Teams from "../utils/BracketsStructure/bracket_4_teams.json" with { type: "json" };
import bracket8Teams from "../utils/BracketsStructure/bracket_8_teams.json" with { type: "json" };
import bracket16Teams from "../utils/BracketsStructure/bracket_16_teams.json" with { type: "json" };
import bracket32Teams from "../utils/BracketsStructure/bracket_32_teams.json" with { type: "json" };

import { prisma } from '../prisma/db.js';


function recorrer2Brackets(miPartido, brackets, torneoId){

  if(!miPartido?.nextMatchId || !miPartido?.myIdMatch) return;
  const siguientePartido = brackets.find(p => p.id === miPartido?.nextMatchId)
  recorrer2Brackets(siguientePartido, brackets,torneoId);
  // eliminacion 
  if(!siguientePartido?.myIdMatch) return;

  try {
    // Inicia una transacción para realizar múltiples consultas como atómicas
    prisma.$transaction(async (prisma) => {
      // Obtiene el partido a eliminar para extraer equipoLocal_id y equipoVisitante_id
      const partido = await prisma.partidos.findUnique({
        where: {
          id: parseInt(siguientePartido.myIdMatch),
        },
        select: {
          equipoLocal_id: true,
          equipoVisitante_id: true,
        },
      });

       if (!partido) {
         throw new Error('Partido no encontrado');
       }

       const { equipoLocal_id, equipoVisitante_id } = partido;

       console.log('torneo ',torneoId);
       //Encuentra y elimina la estadística más reciente del equipo local en el torneo
       const latestLocalStat = await prisma.estadisticas.findFirst({
         where: {
           torneo_id: parseInt(torneoId),
           equipo_id: equipoLocal_id,
         },
         orderBy: {
           id: 'desc',   //Ordenar por id de mayor a menor
         },
       });

       if (latestLocalStat) {
         await prisma.estadisticas.delete({
           where: {
             id: latestLocalStat.id,
           },
         });
       }

       //Encuentra y elimina la estadística más reciente del equipo visitante en el torneo
       const latestVisitorStat = await prisma.estadisticas.findFirst({
         where: {
           torneo_id: parseInt(torneoId),
           equipo_id: equipoVisitante_id,
         },
         orderBy: {
           id: 'desc',  // Ordenar por id de mayor a menor
         },
       });

       if (latestVisitorStat) {
         await prisma.estadisticas.delete({
           where: {
             id: latestVisitorStat.id,
           },
         });
       }

       //Elimina el partido
       const deletedPartido = await prisma.partidos.delete({
         where: {
           id: parseInt(siguientePartido.myIdMatch),
         },
       });
     });
   } catch (error) {
     console.error('Error al eliminar el partido y las estadísticas más recientes:', error);
   }
}

export const updateBracket = async (partidoId, torneoId) => {
  const torneo = await prisma.torneos.findUnique({
    where: { id: Number(torneoId) },
    select: { cantEquipo: true },
  });

  const partidosToBracket = await prisma.partidos.findMany({
    where: {
      torneo_id: Number(torneoId), // Filtrar los partidos por el torneoId
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

  const theBrackets = brackets(partidosToBracket, torneo.cantEquipo);
  const miPartido = theBrackets.find(p => Number(p.myIdMatch) === Number(partidoId) ); 
  recorrer2Brackets(miPartido, theBrackets, Number(torneoId));
}

export const brackets = (partidos, cantEquipoTorneo) => {
    //Selector de brackets
    let bracket = [];
    switch (cantEquipoTorneo) {
      case 4:
        bracket = JSON.parse(JSON.stringify(bracket4Teams)); // hace copia de mi json base
        break;

      case 8:
        bracket = JSON.parse(JSON.stringify(bracket8Teams));
        break;

      case 16:
        bracket = JSON.parse(JSON.stringify(bracket16Teams));
        break;

      case 32:
        bracket = JSON.parse(JSON.stringify(bracket32Teams));
        break;
    }
    const partidosCount = partidos ? partidos.length : 0;
    if(partidosCount){
      const listNoOrdenPartido = partidos.filter((partido) => partido.ordenPartido === null);//TO DO: se podra eliminar despues de normalizar los demas datos de la BD
      const listOrdenPartido = partidos.filter((partido) => partido.ordenPartido !== null);
      partidos = [...listOrdenPartido,...listNoOrdenPartido];
      // console.log(partidos);
      for (let i = 0; i < partidosCount; i++) {
        let partido = partidos[i];
        let index = partido.ordenPartido ?? i;
        // (partido.ordenPartido != null ? partido.ordenPartido : i);

        let nameParty = null;
        if (partido.equipos_partidos_equipoLocal_idToequipos?.name != null || partido.equipos_partidos_equipoVisitante_idToequipos?.name != null) {
          nameParty = `${partido.equipos_partidos_equipoLocal_idToequipos?.name} vs ${partido.equipos_partidos_equipoVisitante_idToequipos?.name}`;
        }

        bracket[index] = {
          ...bracket[index],
          name: nameParty,
          fechaPartido: new Date(partido.fechaPartido).toLocaleDateString(),
          horaPartido: new Date(partido.horaPartido).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          jornada: new Date(partido.jornada).toLocaleDateString(),
          myIdMatch: partido.id,
          participants: [
            {
              id: partido.equipoLocal_id,
              resultText: partido.resLocal.toString(),
              isWinner: partido.resLocal > partido.resVisitante,
              //         // status: "PLAYED",
              name: partido.equipos_partidos_equipoLocal_idToequipos?.name || '',
              image: partido.equipos_partidos_equipoLocal_idToequipos?.image || 'logoEquipo.jpg',
            },
            {
              id: partido.equipoVisitante_id,
              resultText: partido.resVisitante.toString(),
              isWinner: partido.resVisitante > partido.resLocal,
              // status: "PLAYED",
              name: partido.equipos_partidos_equipoVisitante_idToequipos?.name || '',
              image: partido.equipos_partidos_equipoVisitante_idToequipos?.image || 'logoEquipo.jpg',
            }
          ]
        };
      }
    }
    const brackePlayed = bracket.map(parent => { // Verificacion de partidos hijos jugados
      // Buscar los hijos del partido actual
      const hijos = bracket.filter(m => m.nextMatchId === parent.id);
    
      // Verificar si todos los hijos ya jugaron (ambos participantes llenos)
      if(hijos.length < 0 ){
        // Devolver el partido con la nueva propiedad
        return {
          ...parent,
          partidosHijos: true
        };
      }
      const partidosHijos = hijos.every(hijo => {
        return hijo.participants.every(p => p && p !== "");
      });
    
      // Devolver el partido con la nueva propiedad
      return {
        ...parent,
        partidosHijos
      };
    });
    // console.log(brackePlayed);
    return brackePlayed;
}