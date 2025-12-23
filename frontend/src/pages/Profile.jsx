import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import './Profile.css';

const avatarOptions = ['🌱', '🌿', '🌳', '🌍', '♻️', '🌾', '🍃', '🌲'];

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        avatar: user?.avatar || '🌱',
        age: user?.age || ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAvatarSelect = (avatar) => {
        setFormData({
            ...formData,
            avatar
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const updatedUser = await profileService.updateProfile({
                name: formData.name,
                avatar: formData.avatar,
                age: formData.age ? parseInt(formData.age) : null
            });
            updateUser(updatedUser);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container fade-in">
            <div className="profile-card card" style={{ marginTop: '2rem' }}>
                <h1>👤 Mi Perfil</h1>
                <p className="profile-subtitle">Personaliza tu información</p>

                {success && (
                    <div className="success-message">
                        ✅ Perfil actualizado correctamente
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="avatar-section">
                        <label>Selecciona tu avatar</label>
                        <div className="avatar-grid">
                            {avatarOptions.map((avatar) => (
                                <button
                                    key={avatar}
                                    type="button"
                                    className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                                    onClick={() => handleAvatarSelect(avatar)}
                                >
                                    {avatar}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="name">Nombre</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="age">Edad</label>
                        <input
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="25"
                            min="1"
                            max="120"
                        />
                    </div>

                    <div className="profile-info">
                        <div className="info-item">
                            <strong>Email:</strong> {user?.email}
                        </div>
                        <div className="info-item">
                            <strong>Huella regional base:</strong> {user?.regional_footprint?.toLocaleString() || '4,000'} kg CO₂e/año
                        </div>
                        <div className="info-item">
                            <strong>Miembro desde:</strong> {new Date(user?.created_at).toLocaleDateString('es-ES')}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <div className="spinner"></div> : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
