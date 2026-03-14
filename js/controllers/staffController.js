import { classService } from '../services/classService.js';

export const staffController = {
    async handleCreateClass(event) {
        event.preventDefault();
        
        const btnSubmit = event.target.querySelector('button');
        btnSubmit.disabled = true; // Feedback: evitar doble click
        btnSubmit.innerText = "Publicando...";

        const classData = {
            type: document.getElementById('classType').value,
            instructor: document.getElementById('classInstructor').value,
            date: document.getElementById('classDate').value,
            time: document.getElementById('classTime').value,
            capacity: parseInt(document.getElementById('classCapacity').value)
        };

        try {
            await classService.createClass(classData);
            alert("¡Clase publicada exitosamente!");
            event.target.reset();
        } catch (error) {
            console.error(error);
            alert("Error al crear la clase. Revisa la consola.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Crear Clase";
        }
    }
};