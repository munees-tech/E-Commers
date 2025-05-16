import jwt from "jsonwebtoken";
import User from "../model/user.model.js"

export const productRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized: Token Not Provided" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECREATE);
            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized: Token Expired" });
            }
            throw error;
        }
    } catch (error) {
        console.error("Error in auth middleware:", error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const adminRoute = async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access Only Admin" });
    };
};