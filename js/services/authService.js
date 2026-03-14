import { auth, db } from '../config/firebaseConfig.js';
import { 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const authService = {
    /**
     * Inicia sesión y retorna los datos del usuario + su rol
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Buscamos el rol en Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (!userDoc.exists()) {
                throw new Error("No se encontró el perfil de usuario en la base de datos.");
            }

            return {
                uid: user.uid,
                ...userDoc.data()
            };
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },

    async logout() {
        await signOut(auth);
        window.location.href = '/index.html';
    }
};