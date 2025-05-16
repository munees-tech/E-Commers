import { razorPay } from "../lib/razorpay.js";
import Coupon from "../model/coupon.model.js";
import Product from "../model/product.model.js";
import crypto from "crypto";
import Order from "../model/order.model.js";

export const createPayment = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.json({ message: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.json({ message: `Product not found: ${item.productId}` });
      }
      totalAmount += product.price * item.quantity;
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && coupon.discountPercentage) {
        totalAmount = totalAmount - (totalAmount * coupon.discountPercentage) / 100;
      }
    }

    const razorpayOrder = await razorPay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    });

    if (totalAmount >= 2000) {
      await createCoupon(req.user._id)
    }
    return res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Error in createPayment controller:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



export const checkoutSuccess = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, metadata } = req.body;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
   
    if (metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: metadata.couponCode,
          userId: metadata.userId,
        },
        {
          isActive: false,
        }
      );
    }
    
    const products = JSON.parse(metadata.products);
    const newOrder = new Order({
      user: metadata.userId,
      products: products.map((product) => ({
        product: product.id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: metadata.totalAmount, 
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment verified, order created, and coupon deactivated if used.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error processing Razorpay checkout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



async function createCoupon(userId) {
  await Coupon.findOneAndDelete({userId})
  try {
    const newCoupon = new Coupon({
      code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      discountPercentage: 20,
      userId: userId,
    });
    await newCoupon.save();
  } catch (error) {
    console.error("Error in createCoupon:", error.message);
  }
}
