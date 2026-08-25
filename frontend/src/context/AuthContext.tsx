import { useState, useContext, createContext, useEffect } from "react";
import { getMe } from '../api/auth';
import type { User } from '../types';

type AuthType = {
    token: string | null;
    user: User | null;
    estConnecte: boolean;
    seConnecter: (t: string) => Promise<void>;
    seDeconnecter: () => void;
}

const AuthContext = createContext<AuthType>(null as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
    const [user, setUser] = useState<User | null>(null)

    // Déconnecte si le token est expirer (2H)
    useEffect(() => {
        if (token && !user) {
            getMe()
                .then(donnees => setUser(donnees))
                .catch(() => seDeconnecter());
        }
    }, [token]);

    async function seConnecter(t: string) {
        localStorage.setItem("token", t)
        setToken(t)
        
        try {
            const donnees = await getMe();
            setUser(donnees);
        } catch (error) {
            console.error("Erreur lors de la récupération du profil");
        }
    }

    function seDeconnecter() {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ token, user, estConnecte: !!token, seConnecter, seDeconnecter }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)