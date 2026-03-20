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

// js/main.js - Agregamos esta función al final o antes del observador
const renderNavbar = (userData) => {
    const authContainer = document.getElementById('authStatus');
    if (!authContainer) return;

    // Detectamos en qué nivel de carpeta estamos para ajustar los href
    const isSubPage = window.location.pathname.includes('pages/');
    const prefix = isSubPage ? '../../' : '';

    if (!userData) {
        authContainer.innerHTML = `<a href="${prefix}index.html" class="btn-link">Inicio / Login</a>`;
        return;
    }

    // Menú para STAFF
    if (userData.role === 'staff') {
        authContainer.innerHTML = `
            <ul class="nav-links">
                <li><a href="${prefix}index.html">Web</a></li>
                <li><a href="${prefix}pages/staff/staff.html">Gestión Clases</a></li>
                <li><a href="${prefix}pages/admin/admin.html">Configuración</a></li>
                <li><button id="btnLogout" class="btn-principal-mini">Cerrar Sesión</button></li>
            </ul>
        `;
    } 
    // Menú para ALUMNOS
    else {
        authContainer.innerHTML = `
            <ul class="nav-links">
                <li><a href="${prefix}pages/alumnos/reserva.html">Reservar</a></li>
                <li><a href="${prefix}pages/alumnos/alumnos.html">Mi Perfil</a></li>
                <li><button id="btnLogout" class="btn-principal-mini">Salir</button></li>
            </ul>
        `;
    }
};

// Dentro de tu onAuthStateChanged en main.js, llama a la función:
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc?.data();
        
        renderNavbar(userData); // <--- INYECTAMOS LA NAV AQUÍ

        // ... resto de tu lógica de redirección ...
    } else {
        renderNavbar(null); // Nav para invitados
        // ...
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', authController.handleLogin);

    const btnLogout = document.getElementById('btnLogout');
    btnLogout?.addEventListener('click', () => signOut(auth));

    // --- CONEXIÓN DE STAFF ---
    const classForm = document.getElementById('createClassForm');
    if (classForm) {
        import('./controllers/staffController.js').then(({ staffController }) => {
            classForm.addEventListener('submit', staffController.handleCreateClass);
            staffController.initVisualLogic();
            
            const btnDelete = document.getElementById('btnBulkDelete');
            btnDelete?.addEventListener('click', staffController.handleBulkDelete);
        });
    }
});