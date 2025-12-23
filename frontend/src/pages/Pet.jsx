import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Stars } from '@react-three/drei';
import api from '../services/api';

// Remove hardcoded API_URL since we use the axios instance from api.js
// const API_URL = 'http://localhost:3000/api';

export default function Pet() {
    const [goleminoData, setGoleminoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [arMode, setArMode] = useState(false);
    const [message, setMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [showEvolutionModal, setShowEvolutionModal] = useState(false);

    useEffect(() => {
        loadGoleminoStatus();
    }, []);

    const loadGoleminoStatus = async () => {
        try {
            const response = await api.get('/golemino/status');
            setGoleminoData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading Golemino:', error);
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        setActionLoading(true);
        try {
            const response = await api.post(`/golemino/${action}`);
            showMessage(response.data.message, 'success');
            loadGoleminoStatus();
        } catch (error) {
            showMessage(error.response?.data?.error || `Error: ${action}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEvolve = async () => {
        setActionLoading(true);
        try {
            const response = await api.post('/golemino/evolve');
            showMessage(response.data.message, 'success');
            setShowEvolutionModal(false);
            loadGoleminoStatus();
        } catch (error) {
            showMessage(error.response?.data?.error || 'Error al evolucionar', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const showMessage = (msg, type = 'info') => {
        setMessage({ text: msg, type });
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) return <div className="pet-container"><div className="loading-spinner">CONECTANDO CON SANTUARIO...</div></div>;
    if (!goleminoData) return <div className="pet-container"><div className="error-message">ERROR DE SINCRONIZACIÓN</div></div>;

    const { golemino_phase, golemino_health, golemino_status, healthLabel, coins, canEvolve } = goleminoData;

    const phaseNames = { baby: 'Retoño', young: 'Guardián', titan: 'Titán Ancestral' };
    const evolutionCosts = { baby: 500, young: 1500, titan: null };

    return (
        <div className="pet-container fade-in">
            {/* 3D Immersive Layer */}
            {!arMode ? (
                <div className="viewer-3d-container">
                    <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                        <Suspense fallback={null}>
                            <Stage environment="forest" intensity={0.5}>
                                <GoleminoModel phase={golemino_phase} status={golemino_status} health={golemino_health} />
                            </Stage>
                            <OrbitControls autoRotate={golemino_status === 'healthy'} autoRotateSpeed={1} enableZoom={true} maxPolarAngle={Math.PI / 1.5} />
                            <Stars radius={100} depth={50} count={2000} factor={4} fade />
                        </Suspense>
                    </Canvas>
                    {/* Atmospheric Particles */}
                    <div className="particle-container">
                        {golemino_status === 'healthy' && [...Array(5)].map((_, i) => <div key={i} className="particle">✨</div>)}
                        {golemino_status.startsWith('sick') && [...Array(5)].map((_, i) => <div key={i} className="particle">🦠</div>)}
                    </div>
                </div>
            ) : (
                <ARViewer isActive={arMode} onClose={() => setArMode(false)}>
                    <GoleminoModel phase={golemino_phase} status={golemino_status} health={golemino_health} />
                </ARViewer>
            )}

            {/* HUD Overlay Layer */}
            <div className="pet-hud-overlay">

                {/* Top HUD: Header & Stats */}
                <div className="pet-header">
                    <div className="pet-title-block">
                        <h1>
                            {phaseNames[golemino_phase]}
                            <span className="phase-badge">Lv.{golemino_phase === 'baby' ? 1 : golemino_phase === 'young' ? 5 : 10}</span>
                        </h1>
                        <div className={`status-badge status-${golemino_status}`}>
                            {healthLabel}
                        </div>
                    </div>

                    <div className="pet-status-block">
                        <div className="lifetime-badge">
                            {goleminoData.lifetime_days} Días de Guardián
                        </div>
                        <button className="ar-toggle" onClick={() => setArMode(!arMode)}>
                            {arMode ? '3D' : 'AR'}
                        </button>

                        {/* Organic Health Bar */}
                        <div className="health-container">
                            <div className="health-blob-wrapper">
                                <div
                                    className={`health-fill ${golemino_health < 30 ? 'critical' : golemino_health < 60 ? 'warning' : ''}`}
                                    style={{ width: `${golemino_health}%` }}
                                ></div>
                                <span className="health-text">{golemino_health}% HP</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Area */}
                <div style={{ position: 'relative', height: '0' }}>
                    {message && (
                        <div className={`message-toast ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Bottom HUD: Footer & Interactions */}
                <div className="pet-footer">
                    <div className="footer-left-group">
                        <div className="wallet-badge">
                            <img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '20px', height: '20px', verticalAlign: 'middle', marginRight: '5px' }} /> {coins.toLocaleString()}
                        </div>

                        {/* Evolution Progress Bar */}
                        {canEvolve !== undefined && (
                            <div className="evolution-progress-container">
                                <div className="evo-progress-label">
                                    <span>{goleminoData.next_evolution_cost ? '⚡ Energía de Evolución' : '🌟 Máximo Poder'}</span>
                                    <span>{goleminoData.next_evolution_cost ? `${goleminoData.evolution_progress}%` : 'COMPLETO'}</span>
                                </div>
                                <div className="evo-progress-track">
                                    <div
                                        className="evo-progress-fill"
                                        style={{ width: `${goleminoData.evolution_progress || 100}%` }}
                                    ></div>
                                </div>
                                {!goleminoData.next_evolution_cost && <div className="evo-complete-text">Evolución Final Alcanzada</div>}
                            </div>
                        )}
                    </div>

                    <div className="actions-grid">
                        <button className="btn-action" onClick={() => handleAction('feed')} disabled={actionLoading || coins < 20}>
                            <div className="action-icon">🍎</div>
                            <span className="action-label">Nutrir</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>-20</span>
                        </button>

                        <button className="btn-action" onClick={() => handleAction('pet')} disabled={actionLoading}>
                            <div className="action-icon">✋</div>
                            <span className="action-label">Acariciar</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>Gratis</span>
                        </button>

                        <button className="btn-action" onClick={() => handleAction('heal')} disabled={actionLoading || coins < 50 || golemino_health >= 80}>
                            <div className="action-icon">💊</div>
                            <span className="action-label">Curar</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>-50</span>
                        </button>

                        {canEvolve && evolutionCosts[golemino_phase] && (
                            <button className="btn-action btn-evo" onClick={() => setShowEvolutionModal(true)} disabled={actionLoading}>
                                ⭐ EVOLUCIONAR
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEvolutionModal && (
                <div className="modal-overlay" onClick={() => setShowEvolutionModal(false)}>
                    <div className="modal-content evolution-modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                        <h2>ASCENSIÓN DISPONIBLE</h2>
                        <p>
                            Tu <strong>{phaseNames[golemino_phase]}</strong> está listo para transformarse.
                            Esta acción es irreversible y aumenta su poder.
                        </p>
                        <p className="evolution-cost">
                            Tributo Requerido: <img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '18px', height: '18px', verticalAlign: 'middle' }} /> {evolutionCosts[golemino_phase]} Brotos
                        </p>
                        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setShowEvolutionModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleEvolve} disabled={actionLoading}>
                                {actionLoading ? 'Iniciando ritual...' : 'CONFIRMAR ASCENSIÓN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
