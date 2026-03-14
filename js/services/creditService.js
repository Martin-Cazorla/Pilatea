import { db } from '../config/firebaseConfig.js';
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Servicio encargado de la lógica pura de créditos en la DB.
 */
export const creditService = {
    
    /**
     * Descuenta 1 crédito de forma segura.
     * @param {string} userId - ID del alumno.
     */
    async deductCredit(userId) {
        const userRef = doc(db, "users", userId);

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw "El usuario no existe";

                const newCredits = userDoc.data().currentCredits - 1;
                if (newCredits < 0) throw "Créditos insuficientes";

                transaction.update(userRef, { currentCredits: newCredits });
            });
            console.log("Crédito descontado con éxito.");
        } catch (error) {
            console.error("Error en la transacción de créditos:", error);
            throw error; // Re-lanzamos para que el controlador lo maneje
        }
    }
};