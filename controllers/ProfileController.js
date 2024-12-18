import { prisma } from '../prisma/db.js'; // Importa Prisma desde el archivo de configuración

export const show = async (req, res) => {
    //console.log("Entrando a SHOW PROFILE");
    try {
        const userId = parseInt(req.params.userId); // Obtiene el userId desde la URL

        // Realiza la consulta en la base de datos para obtener el usuario
        const user = await prisma.users.findFirst({
            where: { id: userId },
            include: {
                equipos: true,  // Incluye los equipos relacionados
                //notifications_notifications_user_idTousers: true,  // Incluye notificaciones
                torneos: true,  // Incluye torneos
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });  // Si no se encuentra el usuario, responde con un 404
        }

        return res.status(200).json(user);  // Si el usuario es encontrado, responde con los datos
    } catch (error) {
        console.error(error);  // Imprime cualquier error en la consola
        return res.status(500).json({ message: 'Something went wrong' });  // Si ocurre un error en la consulta, responde con un error 500
    }
};
//------------------------------------------------------------------------------
// EDIT / UPDATE PROFILE <-
export const update = async (req, res) => {
    const userId = parseInt(req.params.userId); // Obtiene el userId desde la URL
    console.log("Updating profile for userId:", userId);
    
    try {
        const updatedData = req.body; // Los datos del perfil que vienen en la solicitud
        
        // Realizamos la actualización en la base de datos
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                name: updatedData.name,
                fsurname: updatedData.fsurname,
                msurname: updatedData.msurname,
                email: updatedData.email,
                gender: updatedData.gender,
                birthdate: new Date(updatedData.birthdate),
                nickname: updatedData.nickname,
                image: updatedData.image, // Asegúrate de manejar la carga de imágenes correctamente
            },
        });

        return res.status(200).json(updatedUser); // Retorna el usuario actualizado
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Something went wrong' }); // Si ocurre un error, responde con un error 500
    }
};
