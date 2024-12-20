import { prisma } from '../prisma/db.js'; // Importa Prisma desde el archivo de configuración
import bcrypt from 'bcryptjs';

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
    const { name, email, fsurname, msurname, gender, birthdate, nickname, currentPassword, newPassword, confirmPassword, image } = req.body;
    console.log("Updating profile:", currentPassword,confirmPassword,newPassword,image);

    // 1. Validar que ninguno de los campos obligatorios sea nulo, a excepción de password e image
    if (!name || !fsurname || !msurname || !nickname || !gender || !birthdate) {
        return res.status(400).json({
            field: 'name',
            message: 'El nombre, apellidos, apodo, género y fecha de nacimiento son obligatorios'
        });
    }

    // 2. Validar gender
    const validGenders = ['masculino', 'femenino', 'hombre', 'mujer','male','female'];
    if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
            field: 'gender',
            message: 'El género debe ser "Masculino", "Femenino", "Hombre" o "Mujer"'
        });
    }

    // 3. Validar que el correo electrónico no esté en uso por otro usuario
    const existingEmail = await prisma.users.findUnique({
        where: { email }
    });

    // Verificar que el correo electrónico sea único o el mismo que el del usuario actual
    if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({
            field: 'email',
            message: 'El correo electrónico ya está en uso'
        });
    }

    // 4. Validar la fecha de nacimiento (birthdate)
    if (isNaN(Date.parse(birthdate))) {
        return res.status(400).json({
            field: 'birthdate',
            message: 'La fecha de nacimiento debe ser válida'
        });
    }
     // 5. Validar que la contraseña actual coincide para la confirmacion
    if (currentPassword) {
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        // Compara la contraseña actual proporcionada con la almacenada en la base de datos
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                field: 'currentPassword',
                message: 'La contraseña actual no es correcta'
            });
        }
    }

    // 5.1 Validar nueva contraseña
    if (newPassword && newPassword !== '') {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                field: 'newPassword',
                message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial'
            });
        }

        // Validar que la nueva contraseña y la confirmación coincidan
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                field: 'confirmPassword',
                message: 'La nueva contraseña y la confirmación no coinciden'
            });
        }
    }


    // 6. Verificación de imagen (si existe)
    /*
    if (image) {
        const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedImageTypes.includes(image.mimetype)) {
            return res.status(400).json({
                field: 'image',
                message: 'La imagen debe ser de tipo PNG, JPEG o JPG'
            });
        }

        if (image.size > 2 * 1024 * 1024) { // 2MB
            return res.status(400).json({
                field: 'image',
                message: 'La imagen no puede pesar más de 2MB'
            });
        }
    }*/

    try {
        let hashedPassword;
        if (newPassword && newPassword !== '') {
            hashedPassword = await bcrypt.hash(newPassword, 10);
        }

        const updatedData = {
            name,
            fsurname,
            msurname,
            nickname,
            gender,
            birthdate: new Date(birthdate),
            email,
            image: image ? image.filename : undefined, //Imagen cargada
            password: hashedPassword || undefined,
        };

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updatedData,
        });

        return res.status(200).json(updatedUser); // Retorna el usuario actualizado
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Algo salió mal al actualizar el perfil' }); // Si ocurre un error, responde con un error 500
    }
};
