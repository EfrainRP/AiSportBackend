import { prisma } from "../prisma/db.js";

function validateUserInput(data) {
    if (typeof data.name !== 'string' || data.name.length > 60) {
        throw new Error('El nombre debe ser una cadena de hasta 60 caracteres.');
    }

    if (typeof data.fsurname !== 'string' || data.fsurname.length > 50) {
        throw new Error('El primer apellido debe ser una cadena de hasta 50 caracteres.');
    }

    if (typeof data.msurname !== 'string' || data.msurname.length > 50) {
        throw new Error('El segundo apellido debe ser una cadena de hasta 50 caracteres.');
    }

    if (typeof data.nickname !== 'string' || data.nickname.length > 50) {
        throw new Error('El apodo debe ser una cadena de hasta 50 caracteres.');
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        throw new Error('El correo electrónico no es válido.');
    }

    if (typeof data.gender !== 'string') {
        throw new Error('El género debe ser una cadena.');
    }

    if (typeof data.password !== 'string' || data.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    // Validar fecha de nacimiento
    const birthDateObj = new Date(data.birthdate);
    if (isNaN(birthDateObj.getTime())) {
        throw new Error('La fecha de nacimiento no es válida.');
    }
}

export const createUser = async (data) => {
    validateUserInput(data);
    const user = await prisma.users.create({
        data: {
            name: data.name,
            fsurname: data.fsurname,
            msurname: data.msurname,
            nickname: data.nickname,
            email: data.email,
            gender: data.gender,
            password: data.password,
            birthdate: data.birthday
        }
    })
    return await user;
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