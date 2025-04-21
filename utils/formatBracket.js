import bracket4Teams from "../utils/BracketsStructure/bracket_4_teams.json" with { type: "json" };
import bracket8Teams from "../utils/BracketsStructure/bracket_8_teams.json" with { type: "json" };
import bracket16Teams from "../utils/BracketsStructure/bracket_16_teams.json" with { type: "json" };
import bracket32Teams from "../utils/BracketsStructure/bracket_32_teams.json" with { type: "json" };

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
    console.log(brackePlayed);
    return brackePlayed;
}