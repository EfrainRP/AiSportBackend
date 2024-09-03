import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

// Mostrar todos
export const getAllUsers = async (req,res) =>{
  try{
      const users = await prisma.users.findMany();
      res.json(users);
  }catch(error){
    res.json({message: error.message})
  }
}

// Mostrar uno
export const getUser = async (req,res) =>{
  try{
      const user = await await prisma.users.findFirst({
        where: {id: req.body.id }
      });
      res.json(user);
  }catch(error){
    res.json({message: error.message})
  }
}

// crear uno
export const createUser = async (req,res) =>{
  try{
      await prisma.users.create({
            data: req.body
        })
  }catch(error){
    res.json({message: error.message})
  }
}

// actualizar uno
export const updateUser = async (req,res) =>{
  try{
      await prisma.users.update(req.body, {
        where: { 
          id: req.body.id }
      });
      res.json({
        "message": "registro actualizado"
      });
  }catch(error){
    res.json({message: error.message})
  }
}

// eliminar uno
export const deleteUser = async (req,res) =>{
  try{
      await prisma.users.destroy({
        where: { 
          id:req.body.id }
      });
      res.json({
        "message": "registro eliminado"
      });
  }catch(error){
    res.json({message: error.message})
  }
}
