import express from "express";
import { signup , login ,logout , refreshToken , getProfile} from "../controller/auth.controller.js";
import { productRoute} from "../middlewere/auth.middlewere.js"

const router = express.Router();
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.post("/refresh-token",refreshToken);
router.get("/profile", productRoute , getProfile)

export default router