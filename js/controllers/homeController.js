import { classService } from '../services/classService.js';
import { classCard } from '../components/cards.js';

export const homeController = {
    async renderAvailableClasses() {
        const container = document.getElementById('classesGrid');
        if (!container) return;

        try {
            container.innerHTML = '<p>Cargando clases...</p>';
            const classes = await classService.getAllClasses();

            if (classes.length === 0) {
                container.innerHTML = '<p>No hay clases disponibles por el momento.</p>';
                return;
            }

            // Limpiamos contenedor y mapeamos las clases al HTML
            container.innerHTML = classes.map(item => classCard(item)).join('');
            
        } catch (error) {
            container.innerHTML = '<p>Error al cargar las clases.</p>';
        }
    }
};

// Exponemos la función al objeto window para que el onclick del string la encuentre
window.bookClass = (classId) => {
    console.log("Intentando reservar clase:", classId);
    // Aquí conectaremos luego la lógica de reserva y descuento de créditos
    alert("Próximamente: Reserva de clase " + classId);
};