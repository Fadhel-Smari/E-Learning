import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js"; // Ajustement du chemin vers utils (même niveau que src)
import { authentifier, exigerRoles } from "../middleware/auth.js";

const router = Router();

// GET /cours
router.get("/", async (req: Request, res: Response) => {
  const niveau = req.query.niveau ? String(req.query.niveau) : undefined;
  const recherche = req.query.recherche ? String(req.query.recherche) : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(10, Number(req.query.limit) || 10);

  const where: any = {};
  if (niveau) where.niveauCours = niveau as any;

  if (recherche) {
    where.OR = [
      { titre: { contains: recherche, mode: "insensitive" } },
      { description: { contains: recherche, mode: "insensitive" } }
    ];
  }

  const [cours, total] = await Promise.all([
    prisma.cours.findMany({ where, skip: (page - 1) * limit, take: limit,
      include: { formateur: { select: { id: true, nom: true, email: true } }},
      orderBy: { creeLe: "desc" },
    }),
    prisma.cours.count({ where }),
  ]);
  res.json({ page, limit, total, cours });
});

// GET /cours/:id
router.get("/:id", authentifier, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  const coursDeBase = await prisma.cours.findUnique({ where: { id }, select: { formateurId: true }});

  if (!coursDeBase) return res.status(404).json({ erreur: "Cours introuvable !" });

  let accesAutorise = false;

  if (userRole === "ADMIN") {
    accesAutorise = true;

  } else if (userRole === "FORMATEUR") {
    if (coursDeBase.formateurId === userId) accesAutorise = true;

  } else if (userRole === "ETUDIANT") {
    const inscriptionExiste = await prisma.inscription.findUnique({
      where: { etudiantId_coursId: { etudiantId: userId, coursId: id }}
    });
    if (inscriptionExiste) { accesAutorise = true; }
  }

  if (!accesAutorise) {
    return res.status(403).json({ erreur: "Accès refusé ! Vous n'êtes pas inscrit ou autorisé à voir ce cours." });
  }

  const coursComplet = await prisma.cours.findUnique({
    where: { id },
    include: {
      formateur: { select: { id: true, nom: true } },
      lecons: { orderBy: { ordre: "asc" } },
      quizs: true
    },
  });

  res.json(coursComplet);
});

// POST /cours
router.post("/", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const { titre, description, niveauCours } = req.body;
  const formateurId = String((req as any).user.sub);

  if (!titre || !description) {
    return res.status(400).json({ erreur: "Le titre et la description sont requis." });
  }

  const cours = await prisma.cours.create({
    data: {
      titre: String(titre),
      description: String(description),
      niveauCours: niveauCours || "DEBUTANT",
      formateurId,
    },
  });

  res.status(201).json(cours);
});

// PATCH /cours/:id
router.patch("/:id", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  const coursExistant = await prisma.cours.findUnique({ where: { id } });
  if (!coursExistant) {
    return res.status(404).json({ erreur: "Cours introuvable !" });
  }

  if (coursExistant.formateurId !== userId && userRole !== "ADMIN") {
    return res.status(403).json({ erreur: "Vous n'êtes pas l'auteur de ce cours." });
  }

  const coursMisAJour = await prisma.cours.update({ where: { id }, data: req.body });
  res.json(coursMisAJour);
});

// DELETE /cours/:id
router.delete("/:id", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  const coursExistant = await prisma.cours.findUnique({ where: { id } });

  if (!coursExistant) {
    return res.status(404).json({ erreur: "Cours introuvable" });
  }

  if (coursExistant.formateurId !== userId && userRole !== "ADMIN") {
    return res.status(403).json({ erreur: "Vous n'êtes pas l'auteur de ce cours." });
  }

  await prisma.cours.delete({ where: { id } });
  res.status(204).end();
});

// POST /cours/:id/lecons
router.post("/:id/lecons", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const coursId = String(req.params.id);
  const { titre, contenu, ordre } = req.body;
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  if (!titre || !contenu || ordre === undefined) {
    return res.status(400).json({ erreur: "titre, contenu et ordre requis." });
  }

  const cours = await prisma.cours.findUnique({ where: { id: coursId } });
  if (!cours) return res.status(404).json({ erreur: "Cours introuvable !" });

  if (cours.formateurId !== userId && userRole !== "ADMIN") {
    return res.status(403).json({ erreur: "Vous n'êtes pas l'auteur de ce cours." });
  }

  try {
    const nouvelleLecon = await prisma.lecon.create({
      data: {
        titre: String(titre),
        contenu: String(contenu),
        ordre: Number(ordre),
        coursId,
      },
    });
    res.status(201).json(nouvelleLecon);
  } catch (error) {
    res.status(400).json({ erreur: "Une lecon avec cet ordre existe deja." });
  }
});

// DELETE /cours/lecons/:leconId
router.delete("/lecons/:leconId", authentifier, exigerRoles(["FORMATEUR", "ADMIN"]), async (req: Request, res: Response) => {
  const leconId = String(req.params.leconId);
  const userId = String((req as any).user.sub);
  const userRole = (req as any).user.role;

  try {
    const leconExistante = await prisma.lecon.findUnique({ where: { id: leconId }, include: { cours: true }});
    if (!leconExistante) return res.status(404).json({ erreur: "Lecon introuvable !" });

    if (leconExistante.cours.formateurId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ erreur: "Vous n'êtes pas autorisé à supprimer ce cours." });
    }
    await prisma.lecon.delete({ where: { id: leconId }});

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ erreur: "Erreur lors de la suppression." });
  }
});

export default router;