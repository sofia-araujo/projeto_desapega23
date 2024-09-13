import { Router } from "express";
import { getProducts, getProductsUser, create } from "../controllers/objetoController.js";

//middlewares
import verifyToken from "../helpers/verify-token.js";
import imageUpload from "../helpers/image-upload.js";

const router = Router();

router.get('/', getProducts)
router.get('/user', verifyToken, getProductsUser)
router.post('/', verifyToken, imageUpload.array("images", 10), create);

export default router;