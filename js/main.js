import { auth, db } from './config/firebaseConfig.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { authController } from './controllers/authController.js';

const path = window.location.pathname;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc?.data();

        // 1. Redirección inteligente SOLO si estamos en el index
        // Esto evita que si ya estás en reserva.html, te vuelva a redirigir
        if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
            if (userData?.role === 'staff') {
                window.location.href = 'pages/staff/staff.html';
            } else {
                window.location.href = 'pages/alumnos/reserva.html';
            }
        }

        // 2. Protección de rutas Staff
        if (path.includes('staff.html') && userData?.role !== 'staff') {
            window.location.href = '../../index.html';
        }
    } else {
        // 3. Si no hay sesión y trata de entrar a páginas privadas
        if (path.includes('pages/')) {
            const level = path.includes('alumnos') || path.includes('staff') ? '../../' : '../';
            window.location.href = `${level}index.html`;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Formulario de Login
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', authController.handleLogin);

    // Lógica de Logout
    const btnLogout = document.getElementById('btnLogout');
    btnLogout?.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // El observador onAuthStateChanged se encargará de la redirección
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
});