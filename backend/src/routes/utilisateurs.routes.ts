import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import { authentifier, exigerRoles } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

const router = Router();

// GET /utilisateurs (Seulement pour ADMIN)
router.get("/", authentifier, exigerRoles(["ADMIN"]), async (req: Request, res: Response) => {
  try {
    const utilisateurs = await prisma.utilisateur.findMany({
      select: { id: true, nom: true, email: true, role: true, creeLe: true },
      orderBy: { creeLe: "desc" }
    });
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ erreur: "Erreur lors de la récupération des utilisateurs." });
  }
});

// GET /utilisateurs/:id
router.get("/:id", authentifier, exigerRoles(["ADMIN"]), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      select: { id: true, nom: true, email: true, role: true, creeLe: true }
    });

    if (!utilisateur) {
      return res.status(404).json({ erreur: "Utilisateur non trouvé." });
    }

    res.json(utilisateur);
  } catch (err) {
    res.status(500).json({ erreur: "Erreur lors de la récupération de l'utilisateur." });
  }
});

// POST /utilisateurs (Créer un Étudiant, Formateur ou Admin)
router.post("/", authentifier, exigerRoles(["ADMIN"]), async (req: Request, res: Response) => {
  const { nom, email, motDePasse, role } = req.body;

  if (!nom || !email || !motDePasse) {
    return res.status(400).json({ erreur: "Nom, email et mot de passe requis." });
  }

  try {
    const motDePasseHache = await bcrypt.hash(motDePasse, 10);

    const nouvelUtilisateur = await prisma.utilisateur.create({
      data: {
        nom,
        email,
        motDePasse: motDePasseHache,
        role: role || "ETUDIANT"
      },
      select: { id: true, nom: true, email: true, role: true, creeLe: true }
    });
    res.status(201).json(nouvelUtilisateur);
  } catch (err) {
    res.status(400).json({ erreur: "Cet email est déjà utilisé." });
  }
});

// PUT /utilisateurs/:id (Modifier le rôle ou les infos)
router.put("/:id", authentifier, exigerRoles(["ADMIN"]), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { nom, email, role } = req.body;

  try {
    const utilisateurMisAJour = await prisma.utilisateur.update({
      where: { id },
      data: { nom, email, role },
      select: { id: true, nom: true, email: true, role: true, creeLe: true }
    });
    res.json(utilisateurMisAJour);
  } catch (err) {
    res.status(400).json({ erreur: "Impossible de mettre à jour cet utilisateur." });
  }
});

// DELETE /utilisateurs/:id
router.delete("/:id", authentifier, exigerRoles(["ADMIN"]), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const adminConnecteId = String((req as any).user?.sub);

  if (id === adminConnecteId) {
    return res.status(400).json({ erreur: "Vous ne pouvez pas supprimer votre propre compte administrateur." });
  }

  try {
    await prisma.utilisateur.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ erreur: "Impossible de supprimer cet utilisateur." });
  }
});

export default router;