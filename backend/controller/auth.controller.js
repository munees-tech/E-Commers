import User from "../model/user.model.js";
import { Redies } from "../lib/redies.js";
import jwt from "jsonwebtoken";


const generateToken = async (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESSTOKEN_SECREATE, {
        expiresIn: "7d" // 7 days
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESHTOKEN_SECREATE, {
        expiresIn: "7d" // 7 days
    });

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await Redies.set(`refreshToken ${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7 days
};

const setCookie = async (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({ message: "User Already Exist" });
        }
        const user = await User.create({ name, email, password });

        // Authentication
        const { accessToken, refreshToken } = await generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        await setCookie(res, accessToken, refreshToken);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = await generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            await setCookie(res, accessToken, refreshToken);
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log(`Error in login controller ${error}`)
        res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is missing" });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECREATE);
            await Redies.del(`refreshToken ${decoded.userId}`);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Logout Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh Token Not Provided" }); 
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESHTOKEN_SECREATE);
        const storedToken = await Redies.get(`refreshToken ${decoded.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" }); 
        }

        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESSTOKEN_SECREATE,
            { expiresIn: "15m" }
        );

        // Set as cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000 ,
        });

        // Optional: get user details if needed
        const user = { id: decoded.userId };

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken,
            user
        });
    } catch (error) {
        console.log(`Error in refreshToken controller: ${error}`);
        return res.status(500).json({ error: error.message }); 
    }
};

export const getProfile = async (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(`Error in getProfileontroller:${error}`);
        return res.status(500).json({ error: error.message });
    };
};
