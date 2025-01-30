import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

async function connect(){
// Verificar la conexión
try{
    await prisma.$connect()
      console.log('✅ Conectado a la base de datos MySQL');
  }catch(error){
      console.log(`❌ No se pudo conectar a la base de datos: ${error}`);
  }
}

export default connect;

/*
// Función para exportar los datos a JSON de la BD <-
export async function exportToJson() {
  await connect();

  try {
    const ai = await prisma.aI.findMany();
    const filePath = path.join(process.cwd(), "prisma/data/ai.json");

    fs.writeFileSync(filePath, JSON.stringify(ai, null, 2));

    const torneos = await prisma.torneos.findMany();
    const filePath2 = path.join(process.cwd(), "prisma/data/torneos.json");

    fs.writeFileSync(filePath2, JSON.stringify(torneos, null, 2));

    const equipos = await prisma.equipos.findMany();
    const filePath3 = path.join(process.cwd(), "prisma/data/equipos.json");

    fs.writeFileSync(filePath3, JSON.stringify(equipos, null, 2));

    const miembros = await prisma.miembro_equipos.findMany();
    const filePath4 = path.join(process.cwd(), "prisma/data/miembros.json");

    fs.writeFileSync(filePath4, JSON.stringify(miembros, null, 2));

    const estadisticas = await prisma.estadisticas.findMany();
    const filePath5 = path.join(process.cwd(), "prisma/data/estadisticas.json");

    fs.writeFileSync(filePath5, JSON.stringify(estadisticas, null, 2));

    const partidos = await prisma.partidos.findMany();
    const filePath6 = path.join(process.cwd(), "prisma/data/partidos.json");

    fs.writeFileSync(filePath6, JSON.stringify(partidos, null, 2));

    const notifications = await prisma.notifications.findMany();
    const filePath7 = path.join(process.cwd(), "prisma/data/notifications.json");

    fs.writeFileSync(filePath7, JSON.stringify(notifications, null, 2));

    console.log(`✅ Datos exportados correctamente a: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error al exportar los datos: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}
// Ejecutar la función de exportación
exportToJson();
*/