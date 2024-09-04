import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

async function connect(){
// Verificar la conexión
try{
    await prisma.$connect()
      console.log('Conectado a la base de datos MySQL');
  }catch(error){
      console.log(`No se pudo conectar a la base de datos: ${error}`);
  }
}

export default connect;