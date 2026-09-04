import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRoles } from "../middleware/auth.js";
import axios from "axios";
import { quizapi } from "../api/quizapi.js";
import { decode } from "html-entities";

const router = Router();

async function recupererQuestionsOpenTDB() {
  try {
    const { data } = await quizapi.get("");

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results.map((q: any) => {
      return {
        enonce: decode(q.question),
        reponseCorrecte: decode(q.correct_answer),
        reponsesFausses: q.incorrect_answers.map((reponse: string) => decode(reponse)),
      };
    });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error("Erreur API OpenTDB - Statut HTTP:", e.response?.status);
    } else {
      console.error("Erreur de réseau ou timeout avec OpenTDB !");
    }
    return null;
  }
}

// GET /quiz/:quizId
router.get("/:quizId", authentifier, async (req: Request, res: Response) => {
  const quizId = String(req.params.quizId);

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ erreur: "Quiz introuvable !" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ erreur: "Erreur lors de la récupération du quiz !" });
  }
});

// POST /quiz/generer/:coursId
router.post("/generer/:coursId", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const coursId = String(req.params.coursId);
  const { titre } = req.body;
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  if (!titre) {
    return res.status(400).json({ erreur: "Le titre du quiz est requis !" });
  }

  try {
    const coursExiste = await prisma.cours.findUnique({
      where: { id: coursId }
    });

    if (!coursExiste) {
      return res.status(404).json({ erreur: "Cours introuvable !" });
    }

    if (coursExiste.formateurId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ erreur: "Action non autorisée pour ce cours !" });
    }

    const questionsTransformees = await recupererQuestionsOpenTDB();

    if (!questionsTransformees) {
      return res.status(502).json({ 
        erreur: "L'API de génération de questions est injoignable !" 
      });
    }

    const nouveauQuiz = await prisma.quiz.create({
      data: {
        titre: String(titre),
        coursId: coursId,
        questions: {
          create: questionsTransformees.map((q: any) => ({
            enonce: q.enonce,
            reponseCorrecte: q.reponseCorrecte,
            reponsesFausses: q.reponsesFausses,
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json({
      message: `Le quiz "${nouveauQuiz.titre}" a été généré avec succès !`,
      quiz: nouveauQuiz
    });

  } catch (error) {
    console.error("Erreur lors de la génération du quiz :", error);
    res.status(500).json({ erreur: "Erreur interne lors de la création du quiz !" });
  }
});


// POST /quiz/:quizId/evaluer
router.post("/:quizId/evaluer", authentifier, exigerRoles(["ETUDIANT", "ADMIN"]), async (req: Request, res: Response) => {
  const quizId = String(req.params.quizId);
  const etudiantId = String((req as any).user.sub);
  const { reponses } = req.body;

  if (!reponses || !Array.isArray(reponses)) {
    return res.status(400).json({ erreur: "Reponses requis !" });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true }
  });

  if (!quiz) return res.status(404).json({ erreur: "Quiz introuvable !" });

  const inscription = await prisma.inscription.findFirst({
    where: { etudiantId, coursId: quiz.coursId }
  });

  if (!inscription) {
    return res.status(403).json({ erreur: "Vous devez être inscrit à ce cours pour passer ce quiz !" });
  }

  let correctes = 0;
  quiz.questions.forEach((q) => {
    const soumission = reponses.find((r) => String(r.questionId) === q.id);
    if (soumission && String(soumission.choix).trim().toLowerCase() === q.reponseCorrecte.trim().toLowerCase()) {
      correctes++;
    }
  });

  const noteFinale = correctes / quiz.questions.length * 100;

  try {
    const scoreQuiz = await prisma.quizScore.upsert({
      where: {
        inscriptionId_quizId: {
          inscriptionId: inscription.id,
          quizId
        }
      },
      update: { score: noteFinale, faitLe: new Date() },
      create: {
        score: noteFinale,
        inscriptionId: inscription.id,
        quizId
      }
    });

    res.status(201).json({ score: noteFinale, details: scoreQuiz });
  } catch (error) {
    res.status(500).json({ erreur: "Erreur lors de l'enregistrement de la note !" });
  }
});

// DELETE /quiz/:quizId
router.delete("/:quizId", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const quizId = String(req.params.quizId);
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { cours: true } });
  if (!quiz) return res.status(404).json({ erreur: "Quiz introuvable !" });

  if (quiz.cours.formateurId !== userId && userRole !== "ADMIN") {
    return res.status(403).json({ erreur: "Action non autorisée pour ce cours !" });
  }

  await prisma.quiz.delete({ where: { id: quizId } });
  res.status(204).end();
});

export default router;