import express from 'express';
import userRoutes from './routes/routes.js';
import connect from './prisma/db.js';

// Libreria para el uso de archivos estaticos de nodejs
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT;

const app = express();

app.use(express.json());

// Hacer que node sirva los archivos de nuestro app React
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use('/sporthub/api', userRoutes);

connect(); //Conecta a la base de datos

// app.get('/',(req,res)=>{
//   res.send('hola mundo')
// });


app.listen(port, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
