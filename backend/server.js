import express from "express";
import connectDb from "./lib/db.js";
import authRoute from "./routes/auth.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import couponRoute from "./routes/coupon.route.js";
import paymentRoutes from "./routes/paymentRoute.js";
import analyticsRoute from "./routes/analyticsRoute.js";
/* import cors from "cors"; */
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

/* app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
})); */

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.path);
  next();
});


app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoute);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"./frontend/dist")))
    app.get("/",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
    })
}


console.log(process.env.NODE_ENV)

console.log(path.join(__dirname, "../frontend/dist"));

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  connectDb();
});
