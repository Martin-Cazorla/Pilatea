import { auth, db } from './config/firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { authController } from './controllers/authController.js';
import { staffController } from './controllers/staffController.js';
import { homeController } from './controllers/homeController.js'; // <--- IMPORTANTE

const path = window.location.pathname;

// OBSERVADOR GLOBAL DE ESTADO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Obtenemos perfil del usuario
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc?.data();

        // 1. Protección de rutas Staff
        if (path.includes('staff.html') && userData?.role !== 'staff') {
            window.location.href = '../../index.html';
        }

        // 2. Lógica para el Index (Home)
        if (path === '/' || path.includes('index.html')) {
            document.getElementById('loginSection')?.classList.add('hidden');
            document.getElementById('classesSection')?.classList.remove('hidden');
            
            // MAGIC: Renderizamos las clases cuando el usuario está logueado
            homeController.renderAvailableClasses();
        }
    } else {
        // Redirección si intenta entrar a áreas privadas sin login
        if (path.includes('staff.html') || path.includes('alumnos.html')) {
            // Ajustamos la ruta de salida dependiendo de dónde estemos
            const redirectPath = path.includes('pages') ? '../../index.html' : 'index.html';
            window.location.href = redirectPath;
        }
    }
});

// ESCUCHA DE EVENTOS DOM
document.addEventListener('DOMContentLoaded', () => {
    // Formulario de Login
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', authController.handleLogin);

    // Formulario de Crear Clase (Página Staff)
    if (path.includes('staff.html')) {
        const createClassForm = document.getElementById('createClassForm');
        createClassForm?.addEventListener('submit', staffController.handleCreateClass);
    }

    // Botón Logout (Delegación de eventos o chequeo de existencia)
    const btnLogout = document.getElementById('btnLogout');
    btnLogout?.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Al hacer logout, el onAuthStateChanged se encargará de redirigir
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
});