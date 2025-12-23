import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { questionnaireService } from '../services/api';
import { gamificationService, missionsService } from '../services/gamificationService';
import './Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [activeMissions, setActiveMissions] = useState([]);
    const [heatmap, setHeatmap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [historyData, profileData, missionsData, heatmapData] = await Promise.all([
                questionnaireService.getResults(7), // Get last 7 for chart
                gamificationService.getGamifiedProfile().catch(() => null),
                missionsService.getActiveMissions().catch(() => []),
                missionsService.getMissionHeatmap().catch(() => ({}))
            ]);
            setHistory(historyData);
            setProfile(profileData);
            setActiveMissions(missionsData);
            setHeatmap(heatmapData || {});
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate XP Progress - use dynamic xp_required from profile
    const xpRequired = profile?.xp_required || (profile?.level * 1000) || 1000;
    const xpPercentage = profile ? (profile.experience / xpRequired) * 100 : 0;

    // Latest footprint logic
    const latestFootprint = history[0]?.total_footprint || profile?.current_footprint || 0;
    const footprintLabel = latestFootprint < 4000 ? "Baja" : latestFootprint < 10000 ? "Media" : "Alta";
    const footprintColor = latestFootprint < 4000 ? "kpi-green" : latestFootprint < 10000 ? "kpi-gold" : "kpi-fire";

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-grid">

                {/* 1. Hero Section */}
                <div className="hero-section">
                    <div className="hero-overlay"></div>
                    <div className="user-welcome">
                        <div className="hero-avatar-frame">
                            <div className="hero-avatar">
                                {profile?.avatar || user?.avatar || '👤'}
                            </div>
                        </div>
                        <div className="hero-info">
                            <div className="rank-badge-hero">{profile?.rank || 'Semilla'}</div>
                            <h1>¡Hola, {profile?.name?.split(' ')[0] || 'Guardián'}! <span style={{ fontSize: '1rem', color: 'var(--color-gold)', verticalAlign: 'middle', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '2px 8px' }}>Lvl {profile?.level || 1}</span></h1>
                            <div className="xp-container">
                                <div className="xp-bar-container">
                                    <div className="xp-bar-fill" style={{ width: `${Math.min(100, xpPercentage)}%` }}></div>
                                </div>
                                <div className="xp-text">{profile?.experience || 0} / {xpRequired} XP</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. KPI Cards HUD */}
                <div className="kpi-section" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {/* Footprint Card */}
                    <div className={`kpi-card ${footprintColor}`}>
                        <div className="kpi-icon-wrapper">🌍</div>
                        <div className="kpi-value">{latestFootprint > 0 ? (latestFootprint / 1000).toFixed(1) : '-'}</div>
                        <div className="kpi-label">Toneladas CO₂/año</div>
                        <div className="kpi-delta text-neon">{footprintLabel}</div>
                    </div>

                    {/* Streak Card */}
                    <div className="kpi-card kpi-fire">
                        <div className="kpi-icon-wrapper">🔥</div>
                        <div className="kpi-value">{profile?.streak_days || 0}</div>
                        <div className="kpi-label">Días en Racha</div>
                        <div className="kpi-delta text-gold">¡Sigue así!</div>
                    </div>

                    {/* Brotos Card */}
                    <div className="kpi-card kpi-gold">
                        <div className="kpi-icon-wrapper">
                            <img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '32px', height: '32px' }} />
                        </div>
                        <div className="kpi-value">{profile?.coins?.toLocaleString() || 0}</div>
                        <div className="kpi-label">Brotos Totales</div>
                        <div className="kpi-delta text-gold">Ir a Tienda</div>
                    </div>
                </div>

                {/* 3. Mission Status / Priority Alert */}
                <div className="mission-alert-section" onClick={() => navigate('/missions')}>
                    {activeMissions.some(m => m.is_mandatory && m.status !== 'completed') ? (
                        <div className="mission-alert-card priority-active">
                            <div className="alert-icon">🚨</div>
                            <div className="alert-content">
                                <h3>MISIÓN PRIORITARIA DETECTADA</h3>
                                <p>Tienes objetivos obligatorios pendientes. ¡Completa tu deber, Guardián!</p>
                            </div>
                            <div className="alert-action">
                                <span className="btn-glitch">VER MISIONES &gt;</span>
                            </div>
                        </div>
                    ) : (
                        <div className="mission-alert-card status-normal">
                            <div className="alert-content">
                                <h3>ZONA DE MISIONES</h3>
                                <p>Todo despejado. Revisa el pool diario para recompensas extra.</p>
                            </div>
                            <div className="alert-action">
                                <span className="btn-text">EXPLORAR &gt;</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Heatmap Section */}
                <div className="chart-section card" style={{ position: 'relative', minHeight: '220px' }}>
                    <div className="section-title">
                        Historial de Misiones (Heatmap)
                    </div>

                    <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', padding: '10px 0', justifyContent: 'center' }}>
                        {(() => {
                            const weeks = 20;
                            const days = 7;
                            const today = new Date();
                            const grid = [];

                            // Calculate start date (Monday of 20 weeks ago)
                            const startDate = new Date(today);
                            startDate.setDate(today.getDate() - (weeks * 7) + (today.getDay() === 0 ? -6 : 1) - today.getDay());

                            for (let w = 0; w < weeks; w++) {
                                const weekColumn = [];
                                for (let d = 0; d < days; d++) {
                                    const currentDate = new Date(startDate);
                                    currentDate.setDate(startDate.getDate() + (w * 7) + d);

                                    const dateStr = currentDate.toISOString().split('T')[0];
                                    const count = heatmap[dateStr] || 0;

                                    // Color intensity logic
                                    let bgOpacity = 0.1;
                                    let bgColor = 'var(--color-neon-green)';

                                    if (count > 0) {
                                        // 1 = low, 2-3 = medium, 4+ = high
                                        if (count >= 4) { bgOpacity = 1; }
                                        else if (count >= 2) { bgOpacity = 0.6; }
                                        else { bgOpacity = 0.3; }
                                    } else {
                                        bgColor = 'rgba(255,255,255,0.1)';
                                    }

                                    weekColumn.push(
                                        <div
                                            key={`${w}-${d}`}
                                            title={`${dateStr}: ${count} misiones`}
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '2px',
                                                background: bgColor,
                                                opacity: count > 0 ? bgOpacity : 0.1
                                            }}
                                        ></div>
                                    );
                                }
                                grid.push(<div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>{weekColumn}</div>);
                            }
                            return grid;
                        })()}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center', fontSize: '0.7rem', marginTop: '10px', color: 'var(--text-secondary)' }}>
                        <span>Menos</span>
                        <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
                        <div style={{ width: '10px', height: '10px', background: 'var(--color-neon-green)', opacity: 0.3, borderRadius: '2px' }}></div>
                        <div style={{ width: '10px', height: '10px', background: 'var(--color-neon-green)', opacity: 0.6, borderRadius: '2px' }}></div>
                        <div style={{ width: '10px', height: '10px', background: 'var(--color-neon-green)', opacity: 1, borderRadius: '2px' }}></div>
                        <span>Más</span>
                    </div>
                </div>

                {/* 5. Recent Activity */}
                <div className="activity-section card">
                    <div className="section-title">
                        Actividad Reciente
                    </div>
                    <div className="activity-list">
                        {/* Mock activity for visual completeness if empty history */}
                        {history.length === 0 && (
                            <div className="activity-item">
                                <div className="activity-details">
                                    <div className="activity-text">Bienvenido a EcoHuella</div>
                                    <div className="activity-time">¡Empieza tu viaje hoy!</div>
                                </div>
                            </div>
                        )}

                        {history.slice(0, 5).map((item, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-details">
                                    <div className="activity-text">Huella calculada: {(item.total_footprint / 1000).toFixed(2)}t</div>
                                    <div className="activity-time">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {profile && (
                            <div className="activity-item">
                                <div className="activity-details">
                                    <div className="activity-text">Racha de {profile.streak_days} días mantenida</div>
                                    <div className="activity-time">Hoy</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
