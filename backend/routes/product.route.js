import express from "express"

import { getAllProducts , getFeaturedProducts , createProduct , deleteProduct , getAllRecommendation , getCatogroyProducts , toogleFeaturedProducts} from "../controller/product.controller.js"

import {productRoute ,adminRoute} from "../middlewere/auth.middlewere.js";

const router = express.Router()

router.get("/" , productRoute , adminRoute  , getAllProducts);
router.get("/featured" , getFeaturedProducts);
router.get("/category/:category" , getCatogroyProducts);
router.get("/recommendations", getAllRecommendation);
router.post("/", productRoute , adminRoute , createProduct)
router.patch("/:id", productRoute , adminRoute , toogleFeaturedProducts)
router.delete("/:id", productRoute , adminRoute , deleteProduct)

export default router;