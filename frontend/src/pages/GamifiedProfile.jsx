import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gamificationService, missionsService } from '../services/gamificationService';
import './GamifiedProfile.css';

export default function GamifiedProfile() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);

    // Badges State
    const [userBadges, setUserBadges] = useState([]);
    const [allBadges, setAllBadges] = useState([]);
    const [badgeFilter, setBadgeFilter] = useState('all'); // all, rare, epic, legendary

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false); // Kept for legacy or general edit toggle if needed
    const [editingName, setEditingName] = useState(false);
    const [editingAvatar, setEditingAvatar] = useState(false);
    const [formData, setFormData] = useState({ name: '', avatar: '', age: '' });

    // Activity State (Mocked or Derived from History)
    const [recentActivity, setRecentActivity] = useState([]);

    const avatarOptions = ['🌱', '🌿', '🌳', '🌍', '♻️', '🌾', '🍃', '🌲', '🌺', '🌻', '🌼', '🌸', '🦊', '🦉', '🦋'];
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [profileData, uBadges, aBadges, history] = await Promise.all([
                gamificationService.getGamifiedProfile(),
                gamificationService.getUserBadges(),
                gamificationService.getAllBadges().catch(() => []),
                missionsService.getMissionHistory(5).catch(() => [])
            ]);

            setProfile(profileData);
            setUserBadges(uBadges);
            setAllBadges(aBadges.length > 0 ? aBadges : mockAllBadges(uBadges));

            // Map history to "Activity Feed" format
            setRecentActivity(history.map(h => ({
                id: h.id,
                type: 'mission',
                desc: `Completaste: ${h.title}`,
                time: formatDate(h.completed_at),
                reward: `+${h.xp_reward || 50} XP`
            })));

            setFormData({
                name: profileData.name || '',
                avatar: profileData.avatar || '🌱',
                age: profileData.age || ''
            });

        } catch (error) {
            console.error('Error loading profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Mock All Badges if API missing
    const mockAllBadges = (unlocked) => {
        const defaults = [
            { id: 101, name: 'Primeros Pasos', icon: '🌱', description: 'Completa tu primera misión', rarity: 'common' },
            { id: 102, name: 'Eco Guerrero', icon: '⚔️', description: 'Completa 10 misiones', rarity: 'rare' },
            { id: 103, name: 'Maestro del Reciclaje', icon: '♻️', description: '5 misiones de residuos', rarity: 'epic' },
            { id: 104, name: 'Guardían Legendario', icon: '👑', description: 'Alcanza el nivel 10', rarity: 'legendary' },
            { id: 105, name: 'Racha de Fuego', icon: '🔥', description: 'Mantén una racha de 7 días', rarity: 'rare' },
            { id: 106, name: 'Salvador de Agua', icon: '💧', description: 'Ahorra 100L de agua', rarity: 'epic' },
            { id: 107, name: 'Sin Plástico', icon: '🥤', description: '30 días sin botellas', rarity: 'legendary' },
            { id: 108, name: 'Transporte Verde', icon: '🚲', description: 'Usa bici 5 veces', rarity: 'common' },
        ];
        return defaults.map(def => {
            const found = unlocked.find(u => u.name === def.name || u.icon === def.icon);
            return found ? { ...def, ...found, unlocked: true } : { ...def, unlocked: false };
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffHours < 24) return `Hace ${diffHours} h`;
        return `Hace ${Math.floor(diffHours / 24)} d`;
    };

    const handleSaveName = async () => {
        try {
            const updated = await gamificationService.updateGamifiedProfile({ name: formData.name });
            setProfile(prev => ({ ...prev, name: updated.name }));
            setEditingName(false);
        } catch (error) {
            console.error('Error updating name:', error);
        }
    };

    const handleSaveAvatar = async (newAvatar) => {
        try {
            const updated = await gamificationService.updateGamifiedProfile({ avatar: newAvatar });
            setProfile(prev => ({ ...prev, avatar: updated.avatar }));
            setFormData(prev => ({ ...prev, avatar: updated.avatar }));
            setEditingAvatar(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    };

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
    if (!profile) return <div className="text-center mt-5">Error cargando perfil.</div>;

    // Derived Data
    const xpToNext = profile.nextLevel ? (profile.nextLevel.experience_required - profile.experience) : 0;
    const progressPercent = profile.progressToNextLevel || 0;

    // Filter Badges
    const displayedBadges = allBadges
        .filter(b => badgeFilter === 'all' || b.rarity === badgeFilter)
        .sort((a, b) => (a.unlocked === b.unlocked) ? 0 : a.unlocked ? -1 : 1);

    const lockedCount = allBadges.filter(b => !b.unlocked).length;
    const unlockedCount = allBadges.filter(b => b.unlocked).length;

    return (
        <div className="gamified-profile-container fade-in">
            {/* 1. HERO SECTION */}
            <div className="profile-hero-section">
                <div className="hero-banner"></div>
                <div className="hero-content">
                    {/* Avatar with Click-to-Edit */}
                    <div className="hero-avatar-container" onClick={() => setEditingAvatar(true)}>
                        <div className="hero-avatar">{profile.avatar}</div>
                        <div className="hero-avatar-overlay">
                            <span>Cambiar<br />Icono</span>
                        </div>
                    </div>

                    <div className="hero-info">
                        <div className="hero-name-row">
                            {!editingName ? (
                                <>
                                    <h1 className="hero-name">{profile.name || 'Guardián Eco'}</h1>
                                    <button className="btn-edit-name" onClick={(e) => { e.stopPropagation(); setEditingName(true); }} title="Editar nombre">✏️</button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="edit-name-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        autoFocus
                                    />
                                    <button className="btn btn-sm btn-primary" onClick={handleSaveName}>OK</button>
                                </div>
                            )}
                        </div>

                        <div className="hero-meta">
                            <div className="hero-meta-item">Miembro desde 2024</div>
                            <div className="hero-meta-item">{user?.email}</div>
                        </div>

                        <div className="level-badge-inline">
                            Nivel {profile.level}
                            <span className="text-neon flex items-center gap-2" style={{ marginLeft: '15px' }}>
                                Rango: {profile.rank} <span style={{ fontSize: '1.5rem' }}>{profile.rank_icon}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Avatar Selection Modal (Overlay) */}
                {editingAvatar && (
                    <div className="fixed inset-0" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="card" style={{ maxWidth: '400px', width: '90%', background: 'var(--bg-card)', padding: '2rem' }}>
                            <h3 className="mb-4 text-center">Elige tu Icono</h3>
                            <div className="flex flex-wrap gap-3 justify-center mb-4">
                                {avatarOptions.map(av => (
                                    <button
                                        key={av}
                                        onClick={() => handleSaveAvatar(av)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '2rem', width: '60px', height: '60px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                            <button className="btn btn-secondary w-full mt-3" onClick={() => setEditingAvatar(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. GLOBAL PROGRESS BAR */}
            <section className="global-progress-section">
                <div className="section-title">Progreso al Siguiente Nivel</div>
                <div className="level-progress-bar-container">
                    <div className="level-progress-labels">
                        <span>Nivel {profile.level}</span>
                        <span>{profile.experience} XP / {profile.nextLevel?.experience_required || 'MAX'} XP</span>
                        <span>Nivel {(profile.level || 0) + 1}</span>
                    </div>
                    <div className="level-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </section>

            {/* 3. STATS GRID (4 Premium Cards) */}
            <section className="stats-premium-grid">
                {/* Brotos */}
                <div className="stat-card-premium">
                    <div className="stat-card-header">
                        <div className="stat-value-big">{profile.coins.toLocaleString()}</div>
                        <div className="stat-icon-bg">🪙</div>
                    </div>
                    <div className="stat-label-small">Brotos Disponibles</div>
                    <div className="stat-footer">
                        {/* Empty footer as requested */}
                    </div>
                </div>

                {/* Racha */}
                <div className="stat-card-premium">
                    <div className="stat-card-header">
                        <div className="stat-value-big">{profile.streak_days} <span style={{ fontSize: '1.5rem' }}>días</span></div>
                        <div className="stat-icon-bg fire-anim">🔥</div>
                    </div>
                    <div className="stat-label-small">Racha Activa</div>
                    <div className="stat-footer text-success">
                        ¡Sigue así, vas genial!
                    </div>
                </div>

                {/* Misiones */}
                <div className="stat-card-premium">
                    <div className="stat-card-header">
                        <div className="stat-value-big">{profile.total_missions_completed}</div>
                        <div className="stat-icon-bg">🎯</div>
                    </div>
                    <div className="stat-label-small">Misiones Completadas</div>
                    <div className="stat-footer">
                        <div className="progress-bar-mini" style={{ width: '80%', background: '#eee' }}>
                            <div className="progress-fill" style={{ width: `${Math.min(100, (profile.total_missions_completed % 10) * 10)}%` }}></div>
                        </div>
                        <span style={{ fontSize: '10px', color: '#999' }}>Prox. logro: {(Math.floor(profile.total_missions_completed / 10) + 1) * 10}</span>
                    </div>
                </div>

                {/* Impacto */}
                <div className="stat-card-premium">
                    <div className="stat-card-header">
                        <div className="stat-value-big">{Math.floor(profile.current_footprint || 0)}</div>
                        <div className="stat-icon-bg">🌳</div>
                    </div>
                    <div className="stat-label-small">Huella de Carbono Base</div>
                    <div className="stat-footer">
                        {/* Empty footer as requested */}
                    </div>
                </div>
            </section>

            {/* 4. BADGES & ACTIVITY SPLIT */}
            <section className="profile-bottom-split">
                {/* Badges Grid */}
                <div className="badges-section-container">
                    <div className="badges-header">
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Logros Desbloqueados</h2>
                        <span className="badges-count">({unlockedCount}/{allBadges.length})</span>
                    </div>

                    <div className="badges-filter-tabs mb-3">
                        {['all', 'common', 'rare', 'epic', 'legendary'].map(filter => (
                            <button
                                key={filter}
                                className={`badge-tab ${badgeFilter === filter ? 'active' : ''}`}
                                onClick={() => setBadgeFilter(filter)}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="badges-grid-premium">
                        {displayedBadges.map((badge, idx) => (
                            <div
                                key={idx}
                                className={`badge-card-premium rarity-${badge.rarity} ${!badge.unlocked ? 'locked' : ''}`}
                                title={badge.description}
                            >
                                <div className="badge-icon-area">
                                    {badge.icon}
                                    {!badge.unlocked && <div className="lock-overlay">🔒</div>}
                                </div>
                                <div className="badge-name-premium">{badge.name}</div>
                                {badge.unlocked && <div className="badge-date-mini">Desbloqueado</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="activity-feed-section">
                    <h2 className="section-title">Actividad Reciente</h2>
                    <div className="activity-list">
                        {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                            <div key={i} className="activity-item">
                                <span className="activity-desc">{act.desc}</span>
                                <div className="activity-meta">
                                    <span>{act.time}</span>
                                    <span className="activity-reward">{act.reward}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-muted text-sm">No hay actividad reciente.</div>
                        )}
                    </div>
                </div>
            </section>
        </div >
    );
}
