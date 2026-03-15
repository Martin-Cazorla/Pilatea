import { db } from '../config/firebaseConfig.js';
import { doc, runTransaction, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Servicio encargado de la persistencia de reservas usando transacciones.
 */
export const bookingService = {
    async processBooking(userId, classId) {
        const userRef = doc(db, "users", userId);
        const classRef = doc(db, "classes", classId);

        return await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            const classSnap = await transaction.get(classRef);

            if (!userSnap.exists() || !classSnap.exists()) {
                throw "Error: No se encontró el usuario o la clase en la base de datos.";
            }

            const userData = userSnap.data();
            const classData = classSnap.data();

            // Doble validación de seguridad dentro de la transacción
            if (userData.currentCredits <= 0) throw "Error: No tienes créditos suficientes.";
            if (classData.enrolledCount >= classData.capacity) throw "Error: La clase ya está completa.";

            // 1. Actualizar créditos del alumno
            transaction.update(userRef, {
                currentCredits: userData.currentCredits - 1
            });

            // 2. Aumentar el contador de inscriptos de la clase
            transaction.update(classRef, {
                enrolledCount: classData.enrolledCount + 1
            });

            // 3. Crear el registro en la colección 'bookings'
            // Generamos un ID automático para el nuevo documento
            const bookingRef = doc(collection(db, "bookings"));
            transaction.set(bookingRef, {
                userId,
                classId,
                classTitle: classData.type,
                date: classData.date,
                time: classData.time,
                status: "confirmed",
                createdAt: serverTimestamp()
            });
        });
    }
};