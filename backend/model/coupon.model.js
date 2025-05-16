import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code:{
            type:String,
            requried:true,
            unique:true
        },
        discountPercentage: {
            type : Number,
            requried:true,
            min:0,
            max:100
        },
        expireDate:{
            type:Date,
            requried:true
        },
        isActive:{
            type:Boolean,
            default:true
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            requried:true,
            unique:true
        }
    },
    {
        timestamps:true
    }
)

const Coupon = mongoose.model("Coupon",couponSchema);

export default Coupon