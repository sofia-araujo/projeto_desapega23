import conn from "../config/conn.js";
import {v4 as uuidv4} from "uuid";
import getToken from "../helpers/get-token.js";
import getUserByToken from "../helpers/get-user-by-token.js";


export const create = async (request, response) => {
    const {nome, categoria, peso, cor, descricao, preco} = request.body;
    const disponivel = 1


    const token = getToken(request);
    const user = await getUserByToken(token);

    if(!nome) {
        response.status(400).json({message: "O nome é obrigatório"});
        return;
    };
    if(!categoria) {
        response.status(400).json({message: "A categoria é obrigatório"});
        return;
    };
    if(!peso) {
        response.status(400).json({message: "O peso é obrigatório"});
        return;
    };
    if(!cor) {
        response.status(400).json({message: "A cor é obrigatório"});
        return;
    };
    if(!descricao) {
        response.status(400).json({message: "A descrição é obrigatório"});
        return;
    };
    if(!preco) {
        response.status(400).json({message: "O preço é obrigatório"});
        return;
    };
    
    const objeto_id = uuidv4();
    const usuario_id = user.usuario_id

    
    let imagem = user.image
    if(request.file){
         imagem = request.file.filename
    }
    
        
    const objetosSql = /*sql*/ `INSERT INTO objetos
        (??, ??, ??, ??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const objetoData = [
        "objeto_id",
        "nome",
        "categoria",
        "peso",
        "cor",
        "descricao", 
        "disponivel",
        "preco",
        "usuario_id",
        objeto_id,
        nome,
        categoria,
        peso,
        cor,
        descricao,
        disponivel,
        preco,
        usuario_id
    ]

    conn.query(objetosSql, objetoData, (err, data) => {
        if(err){
            console.error(err);
            response.status(500).json({Err: "Erro ao cadastrar objeto"});
            return;
        };
        //[imagem1.png, imagem]
        if(request.files){
            const insertImageSql = /*sql*/ `INSERT INTO objeto_images (image_id, image_path, objeto_id) VALUES ?`

            const imageValues = request.files.map((file)=>[
                uuidv4(),
                file.filename,
                objeto_id
                
            ])

            conn.query(insertImageSql, [imageValues], (err, data) => {
                if(err){
                    console.error(err);
                    response.status(500).json({Err: "Erro ao cadastrar imagens"});
                    return;
                };

                response.status(201).json({message: "Objeto criado com sucesso "})
            })
        }else {
            response.status(201).json({message: "Objeto criado com sucesso!"})
        }
    
        response.status(201).json({message: "Objeto cadastrado com sucesso"})
    })
  

   
}

export const getProducts = (request, response) => {
    const sql = /*sql*/ `SELECT * FROM livros`

    conn.query(sql, (err, data) => {
        if(err){
            console.error(err);
            response.status(500).json({Err: "Erro ao buscar livros"});
            return;
        };

        if(data.length === 0){
            response.status(404).json({message: "Não há livros cadastrados"});
            return;
        }

        const livros = data

        response.status(200).json(livros)
    })
}

export const getProductsUser = async (request, response) => {


    try {
        const token = getToken(request);
        const user = await getUserByToken(token);
        const userId = user.usuario_id
        const sql = /*sql*/ `SELECT * FROM livros WHERE ?? = ?`
        const sqlData = ["usuario_id", userId]
    
        conn.query(sql, sqlData, (err, data) => {
            if(err){
                console.error(err);
                response.status(500).json({Err: "Erro ao buscar livros"});
                return;
            };
    
            if(data.length === 0){
                response.status(404).json({message: "Não há livros cadastrados"});
                return;
            }
    
            const livros = data
    
            response.status(200).json(livros)
        })
    } catch (error) {
        console.error(error)
        return
    }

   
}

