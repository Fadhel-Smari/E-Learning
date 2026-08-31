import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import coursRoutes from "./routes/cours.routes.js";
import inscriptionRoutes from "./routes/inscriptions.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import cors from 'cors';


dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());
app.use("/auth", authRoutes);
app.use("/cours", coursRoutes);
app.use("/inscriptions", inscriptionRoutes);
app.use("/quiz", quizRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur demarre sur http://localhost:${PORT}`);
});