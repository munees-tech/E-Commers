import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const Redies = new Redis(process.env.REDIES_API_URL);