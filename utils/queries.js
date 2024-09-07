import { prisma } from "../prisma/db.js";

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