import mongoose from "mongoose";

const connectDb = async ()=>{
    try {
        mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected succesfully");
    } catch (error) {
        console.log(`Mongodb connection Error ${error.message}`);
        process.exit(1);
    };
};

export default connectDb;