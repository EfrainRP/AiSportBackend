import { prisma } from "../prisma/db.js";

function validateUserInput(data) {
    // Validar tipos y formatos
    const errors = [];
    if (typeof data.name !== 'string' || data.name.length > 60) {
        errors.push('El nombre debe ser una cadena de hasta 60 caracteres.');
    }

    if (typeof data.fsurname !== 'string' || data.fsurname.length > 50) {
        errors.push('El primer apellido debe ser una cadena de hasta 50 caracteres.');
    }

    if (typeof data.msurname !== 'string' || data.msurname.length > 50) {
        errors.push('El segundo apellido debe ser una cadena de hasta 50 caracteres.');
    }

    if (typeof data.nickname !== 'string' || data.nickname.length > 50) {
        errors.push('El apodo debe ser una cadena de hasta 50 caracteres.');
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.push('El correo electrónico no es válido.');
    }

    if (typeof data.gender !== 'string') {
        errors.push('El género debe ser una cadena.');
    }

    if (typeof data.password !== 'string' || data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres.');
    }

    // Validar fecha de nacimiento
    const birthDateObj = new Date(data.birthdate);
    if (isNaN(birthDateObj.getTime())) {
        errors.push('La fecha de nacimiento no es válida.');
    }

    if (errors.length > 0) {
        throw new Error('Errores de validación: \n', errors);
    }
    return;
}

export const createUser = async (data) => {
    try{
        // Validar si faltan campos
        if (!data.name || !data.fsurname || !data.msurname || !data.nickname || !data.email || !data.password || !data.birthdate) {
            throw new Error('Faltan campos por llenar.');
        }
        validateUserInput(data);
        // TODO : Control de user existed
        
    }catch(error){
        console.log(error);
    }finally{
    const user = await prisma.users.create({
        data: {
            name: data.name,
            fsurname: data.fsurname,
            msurname: data.msurname,
            nickname: data.nickname,
            email: data.email,
            gender: gender || 'N/E', // Asignar 'N/E' si el género no se especifica
            password: hashedPassword,
            birthdate: birthDateObj, // Fecha como un objeto Date
        }
    })
    return await user;
    }
}

//Mostrar todos los usuarios
export const getAllUsers = async () => {
    const users = await prisma.users.findMany();
    return users;
}

// Mostrar un usuario
export const getUser = async (userID) => {
    const userINT = parseInt(userID); //Convertir el string a int
    const user = await prisma.users.findFirst({
        where: { id: userINT }
    });
    return user;
}


// Mostrar un usuario
export const getTorneos = async (userID) => {
    const userINT = parseInt(userID); //Convertir el string a int
    const torneosUser = await prisma.torneos.findMany({
        where: { user_id: userINT }
    });
    return torneosUser;
}