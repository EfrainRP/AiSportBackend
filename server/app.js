import express from 'express';
import userRoutes from './routes/routes.js';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use('/api/sporthub', userRoutes);

// Verificar la conexión
try{
  await prisma.$connect()
    console.log('Conectado a la base de datos MySQL');
}catch(error){
    console.log(`No se pudo conectar a la base de datos: ${error}`);
}
// app.get('/',(req,res)=>{
//   res.send('hola mundo')
// });

app.listen(port, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
