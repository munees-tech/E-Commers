import express from "express"
import { productRoute } from "../middlewere/auth.middlewere.js"
import {getCartProducts,addToCart,removeFromCart,updateQuantity} from "../controller/cart.controller.js"

const router = express.Router()

router.get("/" , productRoute , getCartProducts)
router.post("/" , productRoute , addToCart)
router.delete("/" , productRoute , removeFromCart)
router.put("/:id" , productRoute , updateQuantity)

export default router