import { creditService } from '../services/creditService.js';
import { bookingService } from '../services/bookingService.js';
import { classService } from '../services/classService.js';

/**
 * Orquestador de la reserva de clases.
 */
export const bookingController = {
    
    async handleBooking(userId, classId) {
        try {
            // 1. Verificar disponibilidad de la clase
            const classData = await classService.getClassById(classId);
            if (classData.enrolledCount >= classData.capacity) {
                alert("Lo sentimos, esta clase está llena.");
                return;
            }

            // 2. Intentar realizar la reserva y el descuento de crédito
            // NOTA: En un sistema PRO, esto debería ser una sola transacción de Firestore
            await creditService.deductCredit(userId);
            await bookingService.createBooking(userId, classId);
            await classService.incrementEnrollment(classId);

            alert("Reserva confirmada con éxito.");
            window.location.reload(); // Refrescar para ver cambios

        } catch (error) {
            alert("No se pudo completar la reserva: " + error);
        }
    }
};