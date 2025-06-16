import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(cors());

app.use("/api/notes", router);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Running on Port: 5001");
  });
});