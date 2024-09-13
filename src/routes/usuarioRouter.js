import { Router } from "express";
import { login, register, getUserById, editUser, checkUser } from "../controllers/usuarioController.js";

//Middlewares / helpers
import verifyToken from "../helpers/verify-token.js";
import imageUpload from "../helpers/image-upload.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/checkuser", checkUser);
router.get("/:id", getUserById);
router.put("/edit/:id", verifyToken, imageUpload.single("imagem"), editUser);

export default router;