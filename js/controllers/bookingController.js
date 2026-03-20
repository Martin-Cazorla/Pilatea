/** Maneja Solo cosas de alumnos (reservar/cancelar clases). */
import { bookingService } from '../services/bookingService.js';
import { db } from '../config/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const bookingController = {
    /** Maneja el intento de reserva de un alumno */
    async attemptBooking(user, classData) {
        try {
            // Verificamos créditos frescos del usuario antes de confirmar
            const userSnap = await getDoc(doc(db, "users", user.uid));
            const userData = userSnap.data();

            if (userData.currentCredits <= 0) {
                throw new Error("No tienes créditos suficientes para reservar.");
            }

            if (classData.enrolledCount >= classData.capacity) {
                throw new Error("Lo sentimos, esta clase ya no tiene cupos disponibles.");
            }

            const confirmReserva = confirm(`¿Confirmas la reserva para ${classData.type} a las ${classData.time}hs?`);
            
            if (confirmReserva) {
                await bookingService.processBooking(user.uid, classData.id);
                alert("¡Clase reservada con éxito!");
                window.location.reload(); // Recargamos para actualizar cupos y calendario
            }

        } catch (error) {
            console.error("Error en attemptBooking:", error);
            alert(error.message);
        }
    }
};