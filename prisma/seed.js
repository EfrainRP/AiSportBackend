import { prisma } from "./db.js"
import bcrypt from "bcrypt";
import JSONequipos from "./data/equipos.json" with { type: "json" };
import JSONestadisticas from "./data/estadisticas.json" with { type: "json" };
import JSONmiembros from "./data/miembros.json" with { type: "json" };
import JSONpartidos from "./data/partidos.json" with { type: "json" };
import JSONtorneos from "./data/torneos.json" with { type: "json" };
import JSONuser from "./data/user.json" with { type: "json" };
// import JSONpartidosTorneos from "./data/partidosTorneos.json" with { type: "json" };

async function main() {
    for (const data of JSONuser) {
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
    for (const data of JSONequipos) {
        await prisma.equipos.create({
            data: {
                name: data.name,
                user_id: data.user_id
            }
        })
    }
    for (const data of JSONtorneos) {
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
    for (const data of JSONpartidos) {
        //Juntamos los datos para obtener el valor en tiempo TIMESTAMP para usarlo despues
        let date = new Date(`${data.fechaPartido} ${data.horaPartido}`);
        // date = date.toISOString().split('T');
        // let time = date[1].split('Z');

        await prisma.partidos.create({
            data: {
                horaPartido: date,
                fechaPartido: date,
                jornada: new Date(data.jornada),
                resLocal: data.resLocal,
                resVisitante: data.resVis,
                equipoLocal_id: data.equipoLocal,
                equipoVisitante_id: data.equipoVis,
                torneo_id: data.torneos_id
            }
        })
    }
    for (const data of JSONestadisticas) {
        await prisma.estadisticas.create({
            data: {
                torneo_id: data.torneo_id,
                equipo_id: data.equipo_id
            }
        })
    }
    for(const data of JSONmiembros){
        const user = await prisma.users.findFirst({where: {id: data.user_miembro }});
        await prisma.miembro_equipos.create({
            data:{
                user_miembro: user.name,
                equipo_id: data.equipo_id
            }
        })
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
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })