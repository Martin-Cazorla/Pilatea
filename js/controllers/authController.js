import { authService } from '../services/authService.js';

export const authController = {
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userData = await authService.login(email, password);
            console.log("Bienvenido:", userData.displayName);

            // Redirección inteligente basada en ROL
            if (userData.role === 'staff') {
                window.location.href = '/pages/staff/staff.html';
            } else {
                // Si es alumno, simplemente refrescamos o mostramos la sección de clases
                alert(`Hola ${userData.displayName}, ya puedes reservar tus clases.`);
                document.getElementById('loginSection').classList.add('hidden');
                document.getElementById('classesSection').classList.remove('hidden');
            }
        } catch (error) {
            alert("Error al ingresar: " + error.message);
        }
    }
};