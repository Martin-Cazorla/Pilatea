// Ejemplo de estructura de componente que inyectaremos en el HTML
export const classCard = (classData) => {
    return `
        <div class="class-card">
            <div class="card-tag">${classData.type}</div>
            <h4>${classData.time} hs</h4>
            <p>${classData.instructor}</p>
            <div class="capacity-info">
                <span>Cupos: ${classData.enrolledCount} / ${classData.capacity}</span>
            </div>
            <button onclick="bookClass('${classData.id}')" class="btn-reserva">
                Reservar Lugar
            </button>
        </div>
    `;
};