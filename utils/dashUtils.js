import { prisma } from "../prisma/db.js";

// Mostrar un usuario
export const getTorneos = async (userID) => {
    const userINT = parseInt(userID); //Convertir el string a int
    const torneosUser = await prisma.torneos.findMany({
        where: { user_id: userINT }
    });
    return torneosUser;
}