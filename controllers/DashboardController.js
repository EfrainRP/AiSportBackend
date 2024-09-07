import * as query from "../utils/queries.js";

export const dashIndex = async (req,res) =>{
  try{
    //MIS TORNEOS
      const torneosUser = await query.getTorneos(req.params.id,10);
      res.json(torneosUser);
  }catch(error){
    res.json({message: error.message})
  }
}