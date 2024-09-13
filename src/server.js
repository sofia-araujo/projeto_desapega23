/**
 * MODEL -> DB BD -> Regras de negocio 
 * CONTROLLER -> controla o que vem da view e devolve o que vem do model
 * VIEW -> Páginas
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

//Importar a conexão com o banco
import conn from "./config/conn.js";

//Importar modulos
import "./models/usuarioModel.js"
import "./models/objetoModel.js"
import "./models/objetoImagesModel.js"

//Importar as rotas
import usuarioRouter from "./routes/usuarioRouter.js";
import objetoRouter from "./routes/objetoRouter.js"

const PORT = process.env.PORT || 3333;
const app = express();

//Apontar para pasta public
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//3 middleware
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

console.log("dirname: ", __dirname)
console.log("filename: ", __filename)
//Pasta para os arquivos estáticos
app.use("/public", express.static(path.join(__dirname, "public")))

//Utilizar as rotas
app.use("/usuarios", usuarioRouter);
app.use("/objetos", objetoRouter);

app.use((request, response) => {
    response.status(404).json({message: "Rota não encontrada"});
});

app.listen(PORT, () => {
    console.log(`Servidor on PORT : ${PORT} 🚀`);
});