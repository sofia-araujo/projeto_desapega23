// pega o token da requisição

const getToken = (request) => {
    //extrai o token
    const authHeader = request.headers.authorization;
    //(baerer token)
    const token = authHeader.split(" ")[1];
    
    return token;
}

export default getToken;