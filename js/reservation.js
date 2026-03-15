import { auth, db } from './config/firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { classService } from './services/classService.js';
import { bookingController } from './controllers/bookingController.js';

let currentDate = new Date();
let selectedDate = null;
let allAvailableClasses = [];

async function init() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Buscamos el nombre real en el documento de usuarios si no está en el perfil
            document.getElementById('user-name').innerText = user.displayName || "Alumno";
            allAvailableClasses = await classService.getAllClasses();
            renderCalendar();
        } else {
            window.location.href = '../../index.html';
        }
    });

    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

function renderCalendar() {
    const daysContainer = document.getElementById('calendar-days');
    const monthYearLabel = document.getElementById('calendar-month-year');
    daysContainer.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearLabel.innerText = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let x = firstDayIndex; x > 0; x--) {
        const div = document.createElement('div');
        div.classList.add('day', 'other-month');
        daysContainer.appendChild(div);
    }

    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.innerText = i;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        // Resaltar hoy
        const today = new Date().toISOString().split('T')[0];
        if (dateStr === today) dayDiv.classList.add('today');

        // Resaltar si tiene clases
        const hasClasses = allAvailableClasses.some(c => c.date === dateStr);
        if (hasClasses) dayDiv.classList.add('has-classes');

        dayDiv.addEventListener('click', () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
            dayDiv.classList.add('active');
            showTimeSlots(dateStr);
        });

        daysContainer.appendChild(dayDiv);
    }
}

function showTimeSlots(dateStr) {
    const container = document.getElementById('time-slots-grid');
        const display = document.getElementById('selected-date-display');
        
        // CORRECCIÓN SENIOR: Evitamos desfases de zona horaria
        const [year, month, day] = dateStr.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day); 
        
        const options = { day: 'numeric', month: 'long' };
        display.innerText = `Horarios para el ${dateObj.toLocaleDateString('es-ES', options)}`;

    const dailyClasses = allAvailableClasses.filter(c => c.date === dateStr);

    if (dailyClasses.length === 0) {
        container.innerHTML = '<p class="empty-msg">No hay clases para este día.</p>';
        return;
    }

    container.innerHTML = dailyClasses.map(c => `
        <div class="time-slot-card">
            <div class="slot-info">
                <span>${c.time} hs - ${c.type}</span>
                <small><i class="fa-solid fa-users"></i> ${c.enrolledCount}/${c.capacity} cupos</small>
            </div>
            <button class="btn-reserva-mini" onclick="handleBookingAttempt('${c.id}')">
                Reservar
            </button>
        </div>
    `).join('');
}

window.handleBookingAttempt = (classId) => {
    const classData = allAvailableClasses.find(c => c.id === classId);
    bookingController.attemptBooking(auth.currentUser, classData);
};

document.addEventListener('DOMContentLoaded', init);