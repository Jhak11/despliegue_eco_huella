import React from 'react';
import './Dashboard.css'; // Reuse dashboard styles for consistency

export default function Construction() {
    return (
        <div className="dashboard-container fade-in">
            <div className="empty-state card" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="empty-icon">🚧</div>
                <h3>Sección en Construcción</h3>
                <p>Estamos trabajando para traer nuevas funcionalidades ecológicas.</p>
                <p>¡Vuelve pronto!</p>
            </div>
        </div>
    );
}
