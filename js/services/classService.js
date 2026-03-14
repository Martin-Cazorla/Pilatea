import { db } from '../config/firebaseConfig.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const classService = {
    /**
     * Crea una nueva clase en la base de datos (Solo Staff)
     */
    async createClass(classData) {
        try {
            const docRef = await addDoc(collection(db, "classes"), {
                ...classData,
                enrolledCount: 0, // Inicia vacía
                status: "active",
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error al crear clase:", error);
            throw error;
        }
    },

    /**
     * Obtiene todas las clases activas ordenadas por fecha
     */
    async getActiveClasses() {
        try {
            const q = query(
                collection(db, "classes"), 
                where("status", "==", "active"),
                orderBy("date", "asc")
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error al obtener clases:", error);
            throw error;
        }
    }
};