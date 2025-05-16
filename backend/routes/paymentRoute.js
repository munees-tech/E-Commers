import express from "express";
import { checkoutSuccess , createPayment } from "../controller/payment.controller.js";
import { productRoute } from "../middlewere/auth.middlewere.js";

const router = express.Router();

router.post("/create-payment" , productRoute , createPayment);
router.post("/checkout-success" , productRoute , checkoutSuccess); 

export default router;