import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes";
import rateLimit from "express-rate-limit";

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(helmet());

app.use("/auth", authRoutes);

export default app;