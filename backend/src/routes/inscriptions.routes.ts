import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRoles } from "../middleware/auth.js";

const router = Router();

// GET /inscriptions
router.get("/", authentifier, exigerRoles(["ETUDIANT", "ADMIN"]), async (req: Request, res: Response) => {
  const etudiantId = String((req as any).user.sub);

  const inscriptions = await prisma.inscription.findMany({
    where: { etudiantId },
    include: {
      cours: {
        include: { formateur: { select: { nom: true } } }
      }
    },
    orderBy: { inscritLe: "desc" }
  });

  res.json(inscriptions);
});


router.post("/", authentifier, exigerRoles(["ETUDIANT", "ADMIN"]), async (req: Request, res: Response) => {
  const etudiantId = String((req as any).user.sub);
  const { coursId } = req.body;

  if (!coursId) {
    return res.status(400).json({ erreur: "Le coursId est obligatoire" });
  }

  const cours = await prisma.cours.findUnique({ where: { id: String(coursId) } });
  if (!cours) {
    return res.status(404).json({ erreur: "Cours introuvable !" });
  }

  try {
    const inscription = await prisma.inscription.create({
      data: {
        etudiantId,
        coursId: String(coursId),
        statut: "EN_COURS",
        progression: 0.0
      }
    });
    res.status(201).json(inscription);
  } catch {
    res.status(400).json({ erreur: "Vous êtes déjà inscrit à ce cours !" });
  }
});

// PATCH /inscriptions/:id
router.patch("/:id", authentifier, exigerRoles(["ETUDIANT", "ADMIN"]), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const etudiantId = String((req as any).user.sub);
  const userRole = (req as any).user.role;
  const { progression, statut } = req.body;

  const inscription = await prisma.inscription.findUnique({ where: { id } });
  if (!inscription) {
    return res.status(404).json({ erreur: "Inscription introuvable !" });
  }

  if (inscription.etudiantId !== etudiantId && userRole !== "ADMIN") {
    return res.status(403).json({ erreur: "Action non autorisée pour Cette inscription !" });
  }

  const updateData: any = {};

  if (progression !== undefined) {
    updateData.progression = Math.min(100, Math.max(0, Number(progression)));
  }

  if (statut !== undefined) {
    updateData.statut = statut;
  }

  const maj = await prisma.inscription.update({
    where: { id },
    data: updateData
  });

  res.json(maj);
});

export default router;