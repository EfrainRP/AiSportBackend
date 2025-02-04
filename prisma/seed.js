import { prisma } from "./db.js"
import bcrypt from "bcrypt";
import JSONequipos from "./data/equipos.json" with { type: "json" };
import JSONestadisticas from "./data/estadisticas.json" with { type: "json" };
import JSONmiembros from "./data/miembros.json" with { type: "json" };
import JSONpartidos from "./data/partidos.json" with { type: "json" };
import JSONtorneos from "./data/torneos.json" with { type: "json" };
import JSONuser from "./data/user.json" with { type: "json" };
import JSONai from "./data/ai.json" with { type: "json" };
import JSONnotifications from "./data/notifications.json" with { type: "json" };
// import JSONpartidosTorneos from "./data/partidosTorneos.json" with { type: "json" };

async function main() {
    for (const data of JSONuser) {
        try {
            await prisma.users.create({
                data: {
                    name: data.name,
                    fsurname: data.fsurname,
                    msurname: data.msurname,
                    nickname: data.nickname,
                    email: data.email,
                    gender: data.gender,
                    password: await bcrypt.hash(data.password, 10),
                    birthdate: new Date(data.birthday)
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONequipos) {
        try {
            await prisma.equipos.create({
                data: {
                    name: data.name,
                    user_id: data.user_id
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONtorneos) {
        try {
            await prisma.torneos.create({
                data: {
                    name: data.name,
                    ubicacion: data.ubicacion,
                    descripcion: data.descripcion,
                    fechaInicio: new Date(data.fechaInicio),
                    fechaFin: new Date(data.fechaFin),
                    cantEquipo: data.cantEquipo,
                    user_id: data.user_id
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONpartidos) {
        try {//Juntamos los datos para obtener el valor en tiempo TIMESTAMP para usarlo despues
            //let date = new Date(`${data.fechaPartido} ${data.horaPartido}`);
            // date = date.toISOString().split('T');
            // let time = date[1].split('Z');

            // Convertir fechaPartido a objeto Date
            let date = new Date(data.fechaPartido);

            // Extraer la hora de horaPartido y ajustarla en fechaPartido
            let hora = new Date(data.horaPartido);

            // Ajustar la fecha con la hora correcta
            date.setUTCHours(hora.getUTCHours(), hora.getUTCMinutes(), hora.getUTCSeconds());
            await prisma.partidos.create({
                data: {
                    horaPartido: date,
                    fechaPartido: date,
                    jornada: new Date(data.jornada),
                    resLocal: data.resLocal,
                    resVisitante: data.resVisitante,
                    equipoLocal_id: data.equipoLocal_id,
                    equipoVisitante_id: data.equipoVisitante_id,
                    torneo_id: data.torneo_id
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONestadisticas) {
        try {
            await prisma.estadisticas.create({
                data: {
                    torneo_id: data.torneo_id,
                    equipo_id: data.equipo_id
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONmiembros) {
        try {
            const user = await prisma.users.findFirst({ where: { id: data.user_miembro } });
            if (user) {
                await prisma.miembro_equipos.create({
                    data: {
                        user_miembro: user.name,
                        equipo_id: data.equipo_id
                    }
                })
            }
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONai) {
        try {
            await prisma.AI.create({
                data: {
                    id: parseInt(data.id,10),
                    user_id: parseInt(data.user_id,10),
                    SS: parseInt(data.SS,10),
                    SA: parseInt(data.SA,10),
                    TM: parseInt(data.TM,10),
                    BC: parseInt(data.BC,10),
                    DR: parseInt(data.DR,10),
                    TO: parseInt(data.TO,10),
                    ST: parseInt(data.ST,10),
                    DD: parseInt(data.DD,10),
                    TR: parseInt(data.TR,10),
                    PF: data.PF,
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    for (const data of JSONnotifications) {
        try {
            await prisma.notifications.create({
                data: {
                    id: parseInt(data.id,10),
                    equipo_id: parseInt(data.equipo_id,10),
                    torneo_id: parseInt(data.torneo_id,10),
                    user_id: parseInt(data.user_id,10),
                    user_id2: parseInt(data.user_id2,10),
                    status: data.status,
                }
            })
        }
        catch (err) {
            console.log(err);
            return;
        }
    }
    
    //Ya no esta la tabla
    // for(const data of JSONpartidosTorneos){
    //     await prisma.partido_torneos.create({
    //         data:{
    //             torneo_id: data.torneo_id,
    //             partido_id: data.partido_id
    //         }
    //     })
    // }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.err(e)
        await prisma.$disconnect()
        process.exit(1)
    })