import { db } from '../config/firebaseConfig.js';
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const userService = {
    /**
     * Obtiene todos los alumnos (Solo para uso del Staff)
     */
    async getAllStudents() {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const students = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().role === "student") {
                    students.push({ id: doc.id, ...doc.data() });
                }
            });
            return students;
        } catch (error) {
            console.error("Error al obtener alumnos:", error);
            throw error;
        }
    },

    /**
     * Carga créditos a un alumno específico
     * @param {string} studentId - El UID del alumno
     * @param {number} amount - Cantidad de créditos a sumar (ej. 10)
     */
    async addCredits(studentId, amount) {
        const studentRef = doc(db, "users", studentId);
        try {
            await updateDoc(studentRef, {
                // Usamos increment para que sea una operación atómica y segura
                currentCredits: increment(amount)
            });
            console.log(`Se cargaron ${amount} créditos al alumno ${studentId}`);
        } catch (error) {
            console.error("Error al cargar créditos:", error);
            throw error;
        }
    }
};