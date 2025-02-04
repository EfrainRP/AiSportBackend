import { prisma } from '../prisma/db.js';


 // Index Regresa todos los equipos disponibles para un torneo (conforme avanza el torneo actualiza) <-
 export const index = async (req, res) => {
    const torneoId = parseInt(req.params.id);

    //console.log("Validando equipos y partidos del torneo ID:", torneoId);

    try {
        // Obtiene el torneo actual <-
        const torneo = await prisma.torneos.findUnique({
            where: { id: torneoId },
            select: {
                cantEquipo: true, // Número de equipos en el torneo
                partidos: {
                    select: {
                        id: true,
                        equipoLocal_id: true,
                        equipoVisitante_id: true,
                        resLocal: true,
                        resVisitante: true
                    }
                }
            }
        });

        if (!torneo) {
            return res.status(404).json({ message: "Torneo no encontrado" });
        }

        // Calcular la cantidad de rondas
        const totalRondas = Math.log2(torneo.cantEquipo);
        let partidosJugados = torneo.partidos.length;
        let equiposRestantes;
        let partidosRonda = [];
        let partidos = torneo.cantEquipo; // Variable que indica cuantos partidos tiene una ronda <-
        let equiposRetornados = 0;

        for (let i = 0; i < totalRondas; i++) {
          partidos = partidos / 2;
          partidosRonda[i] = partidos; // PartidosRonda es un array de cuantos partidos hay por ronda
        }
        //console.log("partidos por RONDA: ",partidosRonda);
        // Si se llega a una nueva ronda, se devuelve la cantidad de partidos de esa ronda <-
        if (partidosRonda.includes(torneo.cantEquipo - partidosJugados)) { 
          equiposRetornados = torneo.cantEquipo - partidosJugados; // Ex: 16,8,4,2,1
          console.log("El valor coincide con algún elemento en partidosRonda.");
        } else { // Devuelve la cantidad de partidos que tiene la ronda actual en el torneo <-
          // Ordenar el array de forma ascendente para encontrar el valor superior más cercano <-
          const sortedPartidosRonda = [...partidosRonda].sort((a, b) => a - b);
          
          // Encontrar el elemento mayor más cercano
          const proximoMayor = sortedPartidosRonda.find(partido => partido > (torneo.cantEquipo - partidosJugados));
          
          if (proximoMayor !== undefined) {
            equiposRetornados = proximoMayor;
          } else {
            // Si no hay un valor mayor, manejarlo (por ejemplo, asignar el máximo o un valor predeterminado)
            equiposRetornados = sortedPartidosRonda[sortedPartidosRonda.length - 1]; // El máximo en el array
          }
          
          console.log(`No coincide, se tomó el próximo mayor más cercano: ${equiposRetornados}`);
        }

        //------------------------------------
        // Identificar la ronda actual, cada ronda se divide al dividir torneo.cantEquipo / 2
        // Ex: torneo.cantEquipo = 32 (1 ronda)
        // 32 / 2 = 16 (2 Ronda) / 2 = 8 (3 Ronda) / 2 = 4 (4 Ronda) / 2 = 2 (5 Ronda) / 2 = 1 (Ganador)
        let partidosPrimerRonda = torneo.cantEquipo / 2;
        //--------------------------------------------------------------
        const torneos = { // PartidoJugado, EquiposRetornados, PartidosOmitidos por tipo de torneo
          8: [ // Acomodo de torneos: Torneo de 8 equipos
            [5, 2, 1]
          ],
          16: [ // Torneo de 16 equipos
            [9, 6, 1],
            [10, 4, 2],
            [11, 2, 3],
            [13, 2, 1]
          ],
          32: [ // Torneo de 32 equipos
            [17, 14, 1],
            [18, 12, 2],
            [19, 10, 3],
            [20, 8, 4],
            [21, 6, 5],
            [22, 4, 6],
            [23, 2, 7],
            [25, 6, 1],
            [26, 4, 2],
            [27, 2, 3],
            [29, 2, 1]
          ]
        };
        // Variables de entrada
        let cantEquipos = torneo.cantEquipo;  // Número de equipos en el torneo
        
        // Se obtiene el tipo de torneo (4,8,16,32) en base a la cantidad de equipos
        let torneoData = torneos[cantEquipos];  // Obtiene los datos según la cantidad de equipos
        let partidosOmitidos = null;
        
        // Recorre para encontrar el valor de partidosJugados
        for (let i = 0; i < torneoData.length; i++) {
          if (partidosJugados === torneoData[i][0]) {
            equiposRetornados = torneoData[i][1];  // Equipos retornados
            partidosOmitidos = torneoData[i][2];  // Partidos omitidos
            break;  
        }}
        //console.log("Equipos retornados:", equiposRetornados);
        //console.log("Partidos omitidos:", partidosOmitidos);
        //--------------------------------------------------------
        //console.log("PARTIDOS",partidosJugados,partidosPrimerRonda);
        // Si ya se completaron la mitad de los partidos del torneo, el torneo paso a la fase de "Seleccionar solo a los que vayan ganando los partidos"
        if (partidosJugados >= (partidosPrimerRonda)) {
            // Filtrar equipos ganadores de los partidos de la ronda actual
            //console.log("equiposRetornados",equiposRetornados);
            const equiposGanadores = [];
            const equiposOmitidos = [];
            // Recorre todos los partidos del torneo actual <-
            torneo.partidos.forEach((partido, index) => { // Omite los partidos que ya jugaron en la ronda actual 
              if (index < partidosJugados - partidosOmitidos) {
                  console.log("PARTIDO TOMADO", partido.id);
          
                  let ganador;
                  // El ganador del partido es que haya tenido mayor "res" de ambos equipos <-
                  if (partido.resLocal >= partido.resVisitante) {
                      ganador = partido.equipoLocal_id;
                  } else if (partido.resVisitante >= partido.resLocal) {
                      ganador = partido.equipoVisitante_id;
                  }
          
                  if (ganador) {
                      // Si el ganador ya existe en el array, eliminar la primera aparición
                      const index = equiposGanadores.indexOf(ganador);
                      if (index !== -1) {
                          equiposGanadores.splice(index, 1); // Eliminar la primera aparición
                      }
          
                      // Añadir el ganador al final del array
                      equiposGanadores.push(ganador);
                  }
              } else {
                  // Añadir equipos de partidos omitidos al array de omitidos
                  equiposOmitidos.push(partido.equipoLocal_id, partido.equipoVisitante_id);
              }
          });
          
          // Eliminar equipos de equiposGanadores que estén presentes en equiposOmitidos
          const equiposFiltrados = equiposGanadores.filter(
              (equipo) => !equiposOmitidos.includes(equipo)
          );
          
          //console.log("Equipos Omitidos:", equiposOmitidos);
          //console.log("Equipos Sin filtr:", equiposGanadores);
          //console.log("Equipos Ganadores Filtrados:", equiposFiltrados);
          
          // ----------------------------------------------------------------
          // Crear el array de equipos ganadores de acuerdo a los últimos equipos retornados
          const arrayEquipos = Array.from(equiposFiltrados);
          
          // Toma los últimos `equiposRetornados` elementos
          const ultimosEquipos = [];
          for (let i = 0; i < equiposRetornados; i++) {
              // pop() para extraer los últimos elementos
              const equipo = arrayEquipos.pop();
              if (equipo !== undefined) ultimosEquipos.push(equipo);
          }
          
          // Convierte los últimos equipos a un nuevo Set
          const equiposGanadoresRecientes = new Set(ultimosEquipos);
          //console.log(" EQUIPOS RETORNADOS: ", equiposGanadoresRecientes);
           //------------------------------------------------------------------
           // Regresa solo los equipos que vayan ganando a lo largo del torneo <-
            equiposRestantes = await prisma.equipos.findMany({
                where: {
                    id: {
                        in: Array.from(equiposGanadoresRecientes)
                    }
                }
            });
            
            //console.log(`Ronda ${rondaActual} completa. Retornando equipos ganadores.`);
            return res.status(200).json(equiposRestantes);
        }
        // Regresa todos los equipos de SportHub, a exepcion de los que ya jugaron en el torneo <-
        // Obtener equipos que aún no han jugado en el torneo
        equiposRestantes = await prisma.equipos.findMany({
            where: {
                NOT: {
                    estadisticas: {
                        some: {
                            torneo_id: torneoId // Equipos asociados al torneo actual
                        }
                    }
                }
            }
        });

        console.log("Regresando equipos que no han jugado en esta ronda.");
        res.status(200).json(equiposRestantes);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al validar equipos y partidos", error });
    }
};
  