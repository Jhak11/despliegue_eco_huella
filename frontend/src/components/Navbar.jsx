import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo Section */}
                <div className="navbar-logo" onClick={() => navigate('/dashboard')}>
                    <span className="logo-icon">🌱</span>
                    <span className="logo-text">EcoHuella</span>
                </div>

                {/* Desktop Navigation */}
                <div className="navbar-links desktop-only">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Inicio
                    </NavLink>
                    <NavLink to="/gamified-profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Perfil
                    </NavLink>
                    <NavLink to="/missions" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Misiones
                    </NavLink>
                    <NavLink to="/education" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Educación
                    </NavLink>
                    <NavLink to="/results" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Mi Huella
                    </NavLink>
                    <NavLink to="/pet" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        Mi Mascota
                    </NavLink>
                </div>

                {/* User/Logout Desktop */}
                <div className="navbar-user desktop-only">
                    <button className="btn-logout" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="navbar-toggle mobile-only" onClick={toggleMenu}>
                    <div className={`hamburger ${isOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {/* Mobile Drawer */}
                <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
                    <div className="drawer-content">
                        <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "drawer-item active" : "drawer-item"}>
                            Inicio
                        </NavLink>
                        <NavLink to="/gamified-profile" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "drawer-item active" : "drawer-item"}>
                            Perfil
                        </NavLink>
                        <NavLink to="/missions" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "drawer-item active" : "drawer-item"}>
                            Misiones
                        </NavLink>
                        <NavLink to="/results" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "drawer-item active" : "drawer-item"}>
                            Mi Huella
                        </NavLink>
                        <NavLink to="/pet" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "drawer-item active" : "drawer-item"}>
                            Mi Mascota
                        </NavLink>
                    </div>

                    <div className="drawer-footer">
                        <button className="btn btn-secondary drawer-logout" onClick={handleLogout}>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile menu */}
            {isOpen && <div className="navbar-overlay" onClick={() => setIsOpen(false)}></div>}
        </nav>
    );
}
