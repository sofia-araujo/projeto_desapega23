import jwt from "jsonwebtoken";
import getToken from "./get-token.js";

const checkToken = (request, response, next) => {
    if(!request.headers.authorization){
         response.status(401).json({message: "Acesso negado"});
         return;
    }

    //buscar o usuário que está logado
    const token = getToken(request);
    if(!token){
        response.status(401).json({message: "Acesso negado"});
        return;
    }

    try {
        const verificado = jwt.verify(token, "SENHASUPERSEGURA");
        request.usuario = verificado;
        next();
    } catch (error) {
        return response.status(400).json({message: "Token Inválido"})
    }
};

export default checkToken;