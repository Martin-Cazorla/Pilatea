import { classService } from '../services/classService.js';

export const staffController = {
    /**
     * Maneja la creación masiva de clases mediante grilla de horarios y días
     */
    async handleCreateClass(event) {
        event.preventDefault();
        const btnSubmit = document.getElementById('btnGenerateGrid'); // Actualizado al nuevo ID
        
        // 1. Captura de valores básicos
        const type = document.getElementById('classType').value;
        const instructor = document.getElementById('classInstructor').value;
        const capacity = parseInt(document.getElementById('classCapacity').value);
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        // 2. Captura de CHIPS (Días y Horas)
        const selectedDays = Array.from(document.querySelectorAll('input[name="day"]:checked'))
                                  .map(cb => parseInt(cb.value));
        
        const selectedHours = Array.from(document.querySelectorAll('input[name="hour"]:checked'))
                                   .map(cb => cb.value);

        // 3. Validación de selección
        if (selectedDays.length === 0 || selectedHours.length === 0) {
            return alert("Seleccioná al menos un día y un horario de la grilla.");
        }

        let classesToCreate = [];
        let currentDate = new Date(startDate + "T00:00:00");
        const limitDate = new Date(endDate + "T00:00:00");

        try {
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Generando Grilla...";

            // Bucle principal: Recorremos el rango de fechas
            while (currentDate <= limitDate) {
                const dayOfWeek = currentDate.getDay();

                // Si el día actual está entre los seleccionados (1=Lun, 2=Mar...)
                if (selectedDays.includes(dayOfWeek)) {
                    
                    // Inyectamos todas las horas seleccionadas para ese día
                    selectedHours.forEach(hour => {
                        classesToCreate.push({
                            type,
                            instructor,
                            capacity,
                            time: hour,
                            date: currentDate.toISOString().split('T')[0]
                        });
                    });
                }
                // Avanzamos al siguiente día
                currentDate.setDate(currentDate.getDate() + 1);
            }

            if (classesToCreate.length === 0) {
                throw new Error("No hay coincidencias de días en el rango de fechas seleccionado.");
            }

            // Envío masivo a Firebase
            await classService.createMultipleClasses(classesToCreate);
            
            alert(`¡Éxito! Se han generado ${classesToCreate.length} clases en el calendario.`);
            event.target.reset();
            
            // Refrescar visualmente los chips (opcional, dependiendo de si el reset lo hace automático)
            document.querySelectorAll('.chip input').forEach(input => input.checked = false);

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Generar Grilla Completa";
        }
    },
    
    /**
     * Borra todas las clases de una fecha específica
     */
    async handleBulkDelete() {
        const dateToDelete = document.getElementById('deleteDate').value;
        if (!dateToDelete) return alert("Por favor, selecciona una fecha para borrar.");

        if (confirm(`¿Eliminar TODAS las clases del ${dateToDelete}? Esta acción es irreversible y afectará a las reservas existentes.`)) {
            try {
                const count = await classService.deleteClassesByDate(dateToDelete);
                alert(`Se eliminaron ${count} clases exitosamente.`);
                window.location.reload();
            } catch (error) {
                alert(error.message);
            }
        }
    }
};