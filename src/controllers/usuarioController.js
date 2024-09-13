import conn from "../config/conn.js";
import bcrypt from "bcrypt";
import {v4 as uuidv4} from "uuid";
import jwt from "jsonwebtoken";
import getToken from "../helpers/get-token.js";
import getUserByToken from "../helpers/get-user-by-token.js";
import createUserToken from "../helpers/create-user-token.js";



export const register = async (request, response) => {
    const {nome, email, telefone, senha, confirmsenha} = request.body;

    if(!nome) {
        response.status(400).json({message: "O nome é obrigatório"});
        return;
    };
    if(!email) {
        response.status(400).json({message: "O email é obrigatório"});
        return;
    };
    if(!telefone) {
        response.status(400).json({message: "O telefone é obrigatório"});
        return;
    };
    if(!senha) {
        response.status(400).json({message: "A senha é obrigatório"});
        return;
    };
    if(!confirmsenha) {
        response.status(400).json({message: "A confirmação da senha é obrigatório"});
        return;
    };

    // Validação se email é valido
    if(!email.includes("@")){
        response.status(409).json({message: "Deve conter @ no email"});
        return;
    };
    // Validação senha
    if(senha !== confirmsenha){
        response.status(409).json({message: "A senha e a confimação da senha devem ser iguais"});
        return;
    };

    const checkSql = /*sql*/` SELECT * FROM usuarios WHERE ?? = ?`;
    const checkDataSql = ["email", email];

    conn.query(checkSql, checkDataSql, async (err, data) => {
        if(err){
            console.error(err);
            response.status(500).json({Err: "Erro ao buscar email para cadastro"});
            return;
        };

        //2º 
        if(data.length > 0){
            response.status(409).json({Err: "Erro o email já está em uso"});
            return;
        }
        
        //Posso fazer o registro
        //Adiciona caracters a mais na senha
        const salt = await bcrypt.genSalt(12);
        //Cria a criptografia
        const senhaHash = await bcrypt.hash(senha, salt);

        //Criar o usuario
        const id = uuidv4();
        const usuario_img = "userDefault.png";
        const insertSql = /*sql*/` INSERT INTO usuarios(??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, ?)`;
        const insertSqlData = [
            "usuario_id",
            "nome",
            "email",
            "telefone",
            "senha",
            "imagem",
            id,
            nome,
            email,
            telefone,
            senhaHash,
            usuario_img];

        conn.query(insertSql, insertSqlData, (err) => {
            if(err){
                console.error(err);
                response.status(500).json({Err: "Erro ao cadastrar usuário"});
                return;
            };

            //1º cria o token
            //2 º passar o token para o front-end
            const userSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`
            const userSqlData = ["usuario_id", id]
            conn.query(userSql, userSqlData, async (err, data) => {
                if(err){
                    console.error(err);
                    response.status(500).json({Err: "Erro ao fazer login"});
                    return;
                };

                const usuario = data[0]

                try {
                    await createUserToken(usuario, request, response)
                } catch (error) {
                    console.log(error)
                    response.status(500).json({Err: "Erro ao processar requisição"});
                }
            })
            // response.status(201).json({message: "Usuário cadastrado"});
        });
    });
};

export const login = (request, response) => {

    const {email, senha} = request.body;

    if(!email){
        response.status(400).json({message: "O email é obrigatório"});
        return;
    };
    if(!senha){
        response.status(400).json({message: "A senha é obrigatório"});
        return;
    };

    const checkEmailSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`;
    const checkEmailData = ["email", email];

    conn.query(checkEmailSql, checkEmailData, async (err, data) => {
        if(err){
            console.error(err);
            response.status(500).json({Err: "Erro ao fazer login"});
            return;
        };

        if(data.length === 0){
            response.status(500).json({Err: "E-mail não está cadastrado"});
            return;
        };

        const usuario = data[0];
        console.log(usuario);
        
        //Comparar senha
        const comparaSenha = await bcrypt.compare(senha, usuario.senha)
        console.log("Compara senha ", comparaSenha)
        if(!comparaSenha){
            response.status(401).json({message: "Senha inválida"})
            return;
        }

        // 1 cria um token
        try {
            await createUserToken(usuario, request, response)
        } catch (error) {
            console.log(error)
            response.status(500).json({Err: "Erro ao processar informações"});
        }

        response.status(200).json({message: "Você está logado"})
    });
};

export const checkUser = (request, response) => {
    let usuarioAtual;
    if(request.headers.authorization){
        //extrair o token -> baerer TOKEN
        const token = getToken(request)
        console.log(token)
        //descriptografar o token jwt.decode
        const decoded = jwt.decode(token, "SENHASUPERSEGURA")
        console.log(decoded)

        const userId = decoded.id
        const selectSql = /*sql*/ `SELECT nome, email, telefone, imagem FROM usuarios WHERE ?? = ?`
        const selectSqlData = ["usuario_id", userId]
        conn.query(selectSql, selectSqlData, (err, data) => {
            if(err){
                console.error(err)
                response.status(500).json({Err: "Erro ao verificar usuário"})
                return
            }
            usuarioAtual = data[0]
            response.status(200).json(usuarioAtual)
        })
    } else {
        usuarioAtual = null
        response.status(200).json(usuarioAtual)
        return
    }
};

//getUserById -> verificar usuário
export const getUserById = (request, response) => {
    const { id } = request.params

    const checkSql = /*sql*/ `SELECT usuario_id, nome, email, telefone, imagem FROM usuarios WHERE ?? = ?`
    const checkDataSql = ["usuario_id", id]

    conn.query(checkSql, checkDataSql, (err, data) => {
        if(err){
            console.error(err)
            response.status(500).json({Err: "Erro ao buscar usuário"})
            return
        }

        if(data.length === 0){
            response.status(404).json({message: "Usuário não encontrado"})
            return
        }

        const usuario = data[0]

        response.status(200).json(usuario)
    })
};

//editUser -> Controlador precisa ser protegido
export const editUser = async (request, response) => {
    const {id} = request.params;

    try {
        const token = getToken(request);
        const user = await getUserByToken(token);
        // console.log(user);

        const {nome, email, telefone} = request.body;

        let imagem = user.image
        if(request.file){
            imagem = request.file.filename
        }

        if(!nome){
            return response.status(400).json({message: "O nome é obrigatório"})
        }
        if(!email){
            return response.status(400).json({message: "O email é obrigatório"})
        }
        if(!telefone){
            return response.status(400).json({message: "O telefone é obrigatório"})
        }

        //1º Verificar se o usuario existe

        const checkSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ?`
        const checkDataSql = ["usuario_id", id]

        conn.query(checkSql, checkDataSql, (err, data) => {
            if(err){
                console.error(err)
                response.status(500).json({Err: "Erro ao buscar usuário"})
                return
            }
            
            if(data.length === 0){
                response.status(404).json({message: "Usuário não encontrado"})
                return
            }

            const checkEmailSql = /*sql*/ `SELECT * FROM usuarios WHERE ?? = ? AND ?? != ?`
            const checkEmailData = ["email", email, "usuario_id", id]

            //2º Evitar usuarios com email repetido
            conn.query(checkEmailSql, checkEmailData, (err, data) => {
                if(err){
                    console.error(err)
                    response.status(500).json({Err: "Erro ao verificar email para update"})
                    return
                }

                if(data.length > 0){
                    response.status(404).json({message: "Email já está em uso"})
                    return
                }

                //3º atualizar usuario
                const updateSql = /*sql*/ `UPDATE usuarios SET ? WHERE ?? = ?`
                const updateData = [{nome, email, telefone, imagem},  "usuario_id", id]
                
                conn.query(updateSql, updateData, (err, data) => {
                    if(err){
                        console.error(err)
                        response.status(500).json({Err: "Erro ao atualizar usuario"})
                        return
                    }
                    response.status(201).json({message: "Usuário atualizado"})
                })
            })
        })
        
    } catch (error) {
        console.error(error)
        response.status(500).json("Erro interno do servidor")
    }
};