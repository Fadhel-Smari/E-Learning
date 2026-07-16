import {Router,  type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { authentifier } from "../middleware/auth.js";
import prisma from "../../utils/prisma.js"


const router = Router()

router.post("/register", async(req: Request, res: Response)=>{
    const { email, nom, motDePasse, role } = req.body
    if(!email || !nom || !motDePasse){
        return res.status(400).json({erreur:"email, nom et mot de passe requis!"})
    }
    try{
        const hash = await bcrypt.hash(motDePasse,10)
        const user = await prisma.utilisateur.create({ data: { email, nom, motDePasse: hash, role }})
        res.status(201).json({id: user.id, email: user.email, nom: user.nom, role: user.role, creeLe: user.creeLe})
    }catch{
        res.status(400).json({ erreur: "Les informations soumises ne sont pas valides" })
    }
});

router.post("/login", async(req:Request, res:Response)=>{
    const { email, motDePasse } = req.body

    if (!email || !motDePasse) {
        return res.status(400).json({ erreur: "Email et mot de passe requis" });
    }

    const user = await prisma.utilisateur.findUnique({ where: { email } })
    if(!user) return res.status(401).json({erreur : "Identifiant Invalide!"})

    const ok = await bcrypt.compare(motDePasse, user.motDePasse)
    if(!ok) return res.status(401).json({ erreur: "Mot de passe invalide!" })

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "2h" }
    );
    res.json({ token })
});

router.get("/me", authentifier, async (req: Request, res: Response) => {
    const id = (req as any).user.sub
    const user = await prisma.utilisateur.findUnique({
        where: { id },
        select: { id: true, email: true, nom: true, role: true, creeLe: true },
    })
    if (!user) return res.status(404).json({ erreur: "Utilisateur introuvable" })
    res.json(user)
});

export default router