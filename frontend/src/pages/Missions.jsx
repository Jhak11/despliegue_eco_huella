import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { missionsService } from '../services/gamificationService';
import './Missions.css';

export default function Missions() {
    const [activeTab, setActiveTab] = useState('daily');
    const [todayData, setTodayData] = useState({ mandatory: null, pool: [], expiresAt: null });
    const [weeklyData, setWeeklyData] = useState({ pool: [], expiresAt: null });
    const [userActiveMissions, setUserActiveMissions] = useState([]); // Missions user has accepted/assigned
    const [loading, setLoading] = useState(true);
    const [showReward, setShowReward] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'daily') {
                const data = await missionsService.getTodayMissions();
                // Separate missions: Mandatory is always active. 
                // POOL missions: 
                // - "Accepted" ones go to Active list.
                // - "Completed" ones ALSO go to active list (requested by user).
                const acceptedOrCompletedPoolMissions = data.pool.filter(m => m.accepted_at || m.status === 'completed');
                const availablePoolMissions = data.pool.filter(m => !m.accepted_at && m.status !== 'completed');

                // Construct "My Missions" list: Mandatory + Accepted/Completed Pool
                let myMissions = [];
                if (data.mandatory) myMissions.push(data.mandatory);
                myMissions = [...myMissions, ...acceptedOrCompletedPoolMissions];

                setTodayData({
                    ...data,
                    pool: availablePoolMissions // Only show unaccepted/active in the pool section
                });
                setUserActiveMissions(myMissions);

            } else {
                const data = await missionsService.getWeeklyMissions();
                setWeeklyData(data);
            }
        } catch (error) {
            console.error('Error loading missions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptMission = async (missionId) => {
        try {
            await missionsService.acceptMission(missionId);
            loadData();
        } catch (error) {
            console.error('Error accepting mission:', error);
            alert(error.response?.data?.error || 'Error al aceptar misión');
        }
    };

    const handleCompleteMission = async (missionId) => {
        try {
            const result = await missionsService.completeMission(missionId);
            setShowReward(result.rewards);
            loadData();
        } catch (error) {
            console.error('Error completing mission:', error);
            alert(error.response?.data?.error || 'Error al completar misión');
        }
    };

    const handleCheckInMission = async (missionId) => {
        try {
            const result = await missionsService.checkInMission(missionId);
            if (result.completed) {
                // If check-in resulted in completion (e.g. 7/7)
                // We trigger complete flow logic or just reload to show completed state
                // Usually backend handles completion rewards on last check-in.
                // We can check if we need to show rewards from result?
                // Backend currently doesn't return full rewards object on check-in unless modified.
                // For now, let's reload data. If completed, backend should have updated status.
                // Ideally we'd show reward here too.
                // Assuming backend logic completed it.
                alert("¡Misión completada!"); // Simpler feedback for now or fetch updated mission
            }
            loadData();
        } catch (error) {
            console.error('Error check-in:', error);
            alert(error.response?.data?.error || 'Error al registrar progreso');
        }
    };

    const handleRefreshPool = async () => {
        // Direct execution without confirm to avoid blocking
        try {
            const data = await missionsService.refreshDailyPool();
            alert(`¡Opciones refrescadas! Nuevo saldo: ${data.newBalance} Brotos`);

            // Reload local state for pool immediately
            const availablePoolMissions = data.pool.filter(m => !m.accepted_at && m.status !== 'completed');
            setTodayData(prev => ({
                ...prev,
                pool: availablePoolMissions
            }));

        } catch (error) {
            console.error('Refresh pool error:', error);
            alert(error.response?.data?.error || 'Error al refrescar las misiones');
        }
    };

    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return '';
        const now = new Date();
        const end = new Date(expiresAt);
        const diffMs = end - now;

        if (diffMs <= 0) return 'Expirado';

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    const getUrgencyColor = (expiresAt) => {
        if (!expiresAt) return '';
        const now = new Date();
        const end = new Date(expiresAt);
        const diffHours = (end - now) / (1000 * 60 * 60);

        if (diffHours <= 0) return 'urgent-expired'; // New class for expired but visible
        if (diffHours < 6) return 'urgent-high';
        if (diffHours < 12) return 'urgent-medium';
        return 'urgent-low';
    };

    const renderBenefits = (benefits) => {
        if (!benefits || Object.keys(benefits).length === 0) return null;

        return (
            <div className="mission-benefits">
                <h4><img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '20px', height: '20px', verticalAlign: 'sub' }} /> Beneficios Directos:</h4>
                <ul>
                    {Object.entries(benefits).map(([type, list]) => (
                        list.map((benefit, idx) => (
                            <li key={`${type}-${idx}`} className={`benefit-${type}`}>
                                {type === 'economic' && <img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '16px', height: '16px', verticalAlign: 'middle', marginRight: '4px' }} />}
                                {type === 'health' && '❤️'}
                                {type === 'safety' && '🛡️'}
                                {type === 'comfort' && '🏠'}
                                {type === 'time' && '⏱️'}
                                {type === 'environmental' && '🌍'}
                                {type === 'social' && '👥'}
                                {' '}{benefit}
                            </li>
                        ))
                    ))}
                </ul>
            </div>
        );
    };

    const renderWeeklyProgress = (mission) => {
        const totalDays = mission.duration_days || 7; // Default 7
        const current = mission.progress || 0;
        const isCompleted = mission.status === 'completed';

        let circles = [];
        for (let i = 1; i <= totalDays; i++) {
            let statusClass = 'pending';
            if (i <= current) statusClass = 'done';
            circles.push(
                <div key={i} className={`progress-circle ${statusClass}`}>
                    {i <= current ? '✓' : i}
                </div>
            );
        }

        const todayChecked = mission.last_check_in === new Date().toISOString().split('T')[0];

        return (
            <div className="weekly-checklist-container">
                <div className="progress-circles-row">
                    {circles}
                </div>
                <div className="weekly-action-row">
                    {isCompleted ? (
                        <button className="btn btn-success" disabled>✓ ¡Misión Completada!</button>
                    ) : todayChecked ? (
                        <button className="btn btn-secondary" disabled> Progreso de hoy registrado</button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => handleCheckInMission(mission.id)}>
                            Registrar día
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderMissionCard = (mission, isPool = false) => {
        const isCompleted = mission.status === 'completed';
        const urgencyClass = getUrgencyColor(activeTab === 'daily' ? todayData.expiresAt : weeklyData.expiresAt);
        const expirationTime = activeTab === 'daily' ? todayData.expiresAt : weeklyData.expiresAt;
        const isWeekly = mission.mission_type === 'weekly';

        // Type Display
        const missionTypeLabel = mission.type === 'educational' ? 'Educativa' : 'Acción Real';

        return (
            <div key={mission.id} className={`mission-card card ${mission.is_mandatory ? 'mandatory' : ''} ${isCompleted ? 'completed' : ''}`}>
                {mission.is_mandatory && <div className="mandatory-badge">Misión Obligatoria</div>}

                <div className="card-header-row">
                    <div className="card-header-badge" style={{ backgroundColor: mission.category_color }}>
                        <span>{mission.category_icon}</span>
                        <span>{mission.category_name}</span>
                    </div>
                    <span className={`mission-type-badge ${mission.type}`}>{missionTypeLabel}</span>
                </div>

                <div className="mission-content-wrapper">
                    <div className="mission-main">
                        <h3>{mission.title}</h3>
                        <p>{mission.description}</p>

                        {renderBenefits(mission.direct_benefits)}

                        <div className={`urgency-timer ${urgencyClass}`}>
                            Expira en: {getTimeRemaining(expirationTime)}
                        </div>
                    </div>

                    <div className="mission-sidebar">
                        <div className="rewards-box">
                            <div className="reward-pill xp">✨ {mission.xp_reward} XP</div>
                            <div className="reward-pill coins"><img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '14px', height: '14px', verticalAlign: 'middle', marginRight: '4px' }} /> {mission.coins_reward}</div>
                            {mission.co2_impact > 0 && (
                                <div className="reward-pill co2" title="Impacto evitado">
                                    🌍 {mission.co2_impact} kg CO2e
                                </div>
                            )}
                        </div>

                        <div className="difficulty-indicator">
                            Dificultad: <span className={`diff-${mission.difficulty}`}>{mission.difficulty}</span>
                        </div>

                        <div className="action-area">
                            {isWeekly ? (
                                // Weekly logic: Checklist instead of single button
                                renderWeeklyProgress(mission)
                            ) : (
                                // Daily logic
                                isCompleted ? (
                                    <button className="btn btn-success" disabled>
                                        ✓ ¡Completada!
                                    </button>
                                ) : (isPool && activeTab === 'daily') ? (
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleAcceptMission(mission.id)}
                                    >
                                        + Aceptar Misión
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleCompleteMission(mission.id)}
                                    >
                                        ✓ Hoy lo hice
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && !todayData.mandatory && weeklyData.pool.length === 0) {
        return (
            <div className="missions-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="missions-container fade-in">
            {/* Reward Notification */}
            {showReward && (
                <div className="reward-notification-overlay">
                    <div className="reward-notification-card slide-in-top">
                        <button className="close-notification-btn" onClick={() => setShowReward(null)}>✕</button>
                        <h2> ¡Misión Completada!</h2>
                        <div className="reward-items-row">
                            <div className="reward-item-pill">
                                <span className="reward-icon">✨</span>
                                <span className="reward-amount">+{showReward.xp} XP</span>
                            </div>
                            <div className="reward-item-pill">
                                <span className="reward-icon"><img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '24px', height: '24px' }} /></span>
                                <span className="reward-amount">+{showReward.coins} Monedas</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="missions-content">
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
                        onClick={() => setActiveTab('daily')}
                    >
                        Misiones Diarias
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                        onClick={() => setActiveTab('weekly')}
                    >
                        Misiones Semanales
                    </button>
                </div>

                {activeTab === 'daily' ? (
                    <div className="daily-view fade-in">
                        {/* Section 1: Active Missions (Mandatory + Accepted) */}
                        <section className="active-section">
                            <div className="section-header-row">
                                <h2> MISIONES DIARIAS</h2>
                                <span className="count-badge">
                                    {userActiveMissions.filter(m => m.status !== 'completed').length} pendientes
                                </span>
                            </div>

                            {userActiveMissions.filter(m => m.status !== 'completed').length > 0 ? (
                                <div className="missions-grid">
                                    {userActiveMissions
                                        .filter(m => m.status !== 'completed')
                                        .map(mission => renderMissionCard(mission, false))}
                                </div>
                            ) : (
                                <div className="empty-section-state">
                                    <p>¡No tienes misiones pendientes! Revisa el pool o descansa.</p>
                                </div>
                            )}
                        </section>

                        {/* Section 2: Completed Missions List */}
                        {userActiveMissions.some(m => m.status === 'completed') && (
                            <section className="completed-section">
                                <div className="section-header-row">
                                    <h2>✅ Misiones Completadas</h2>
                                </div>
                                <div className="missions-grid">
                                    {userActiveMissions
                                        .filter(m => m.status === 'completed')
                                        .map(mission => renderMissionCard(mission, false))}
                                </div>
                            </section>
                        )}

                        <hr className="section-divider" />

                        {/* Section 3: Available Pool */}
                        <section className="pool-section">
                            <h2>Pool de Misiones Opcionales</h2>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p className="section-subtitle" style={{ margin: 0 }}>Elige hasta 3 misiones extra para ganar más recompensas hoy.</p>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleRefreshPool}
                                    title="Gasta 20 Brotos para obtener nuevas opciones"
                                >
                                    🔄 Refrescar (20 <img src="/assets/brotos_coin.png" alt="Brotos" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />)
                                </button>
                            </div>
                            <div className="missions-grid">
                                {todayData.pool.map(mission => renderMissionCard(mission, true))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="weekly-view fade-in">
                        <section className="pool-section">
                            <h2>Retos de la Semana</h2>
                            <p className="section-subtitle">Objetivos de alto impacto. Tienes 7 días para completarlos (Acciones sostenidas).</p>
                            <div className="missions-grid">
                                {weeklyData.pool.map(mission => renderMissionCard(mission))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
