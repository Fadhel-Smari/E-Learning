import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import coursRoutes from "./routes/cours.routes.js";


dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/cours", coursRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
});