import { bookingService } from '../services/bookingService.js';
import { db } from '../config/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const bookingController = {
    async attemptBooking(user, classData) {
        try {
            // Check de Créditos (Dato fresco)
            const userSnap = await getDoc(doc(db, "users", user.uid));
            const userData = userSnap.data();

            if (userData.currentCredits <= 0) {
                throw new Error("No tienes créditos suficientes.");
            }

            if (classData.enrolledCount >= classData.capacity) {
                throw new Error("Esta clase ya está completa.");
            }

            const confirmReserva = confirm(`¿Reservar ${classData.type} a las ${classData.time}hs?`);
            
            if (confirmReserva) {
                await bookingService.processBooking(user.uid, classData.id);
                alert("¡Reserva confirmada!");
                window.location.reload();
            }

        } catch (error) {
            alert(error.message || error);
        }
    }
};