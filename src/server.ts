import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";


connectDB();

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running`);
});