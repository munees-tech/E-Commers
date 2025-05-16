import { getCoupon , validateCoupon} from "../controller/coupon.controller.js"
import {productRoute} from "../middlewere/auth.middlewere.js"

import express from "express"

const router = express.Router()

router.get("/", productRoute , getCoupon)
router.post("/validate" , productRoute , validateCoupon)

export default router