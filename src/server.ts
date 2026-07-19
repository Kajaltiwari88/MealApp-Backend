import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { redisConnect } from "./config/redis";

connectDB();
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
  await redisConnect();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();
