import { db } from '../config/firebaseConfig.js';
// IMPORTANTE: Todas las funciones de base de datos vienen de firebase-firestore.js
import { 
    collection, 
    addDoc, 
    getDocs, 
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
     * Obtiene todas las clases de la colección
     */
    async getAllClasses() {
        try {
            const querySnapshot = await getDocs(collection(db, "classes"));
            
            // Mapeamos los documentos para incluir el ID de Firebase
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error en el servicio de clases:", error);
            throw error;
        }
    }
};