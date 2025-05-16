import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, "username is requried"]
    },

    email: {
        type: String,
        required: [true, "Email is requried"],
        unique: true
    },

    password: {
        type: String,
        required: [true, "Password is requried"],
        minlength: [6, "Password should be at least 6 characters long"]
    },

    cartItem: [
        {
            quantity: {
                type: Number,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],

    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
}, {timestamps: true})



userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function (password){
    return bcrypt.compare(password,this.password)
}

const User = mongoose.model("User", userSchema);

export default User;