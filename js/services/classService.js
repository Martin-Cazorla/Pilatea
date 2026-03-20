import { db } from '../config/firebaseConfig.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    deleteDoc, 
    doc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const classService = {
    /** Crea una sola clase */
    async createClass(classData) {
        try {
            const docRef = await addDoc(collection(db, "classes"), {
                ...classData,
                enrolledCount: 0,
                status: "active",
                createdAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error al crear clase:", error);
            throw error;
        }
    },

    /** Crea múltiples clases (Carga Masiva) */
    async createMultipleClasses(classesArray) {
        try {
            const promises = classesArray.map(classData => this.createClass(classData));
            return await Promise.all(promises);
        } catch (error) {
            console.error("Error en carga masiva:", error);
            throw error;
        }
    },

    /** Obtiene todas las clases */
    async getAllClasses() {
        try {
            const querySnapshot = await getDocs(collection(db, "classes"));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error al obtener clases:", error);
            throw error;
        }
    },

    /** Borra todas las clases de una fecha (Borrado Masivo) */
    async deleteClassesByDate(dateStr) {
        try {
            const q = query(collection(db, "classes"), where("date", "==", dateStr));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                throw new Error("No hay clases registradas en esa fecha.");
            }

            const deletePromises = querySnapshot.docs.map(documento => 
                deleteDoc(doc(db, "classes", documento.id))
            );
            
            await Promise.all(deletePromises);
            return querySnapshot.size;
        } catch (error) {
            console.error("Error en borrado masivo:", error);
            throw error;
        }
    }
};